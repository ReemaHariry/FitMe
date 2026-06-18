"""
Nutrition Routes

Handles calorie calculation (BMR + TDEE) and AI-generated personalized nutrition plans.
Data is sourced directly from the user's profile in the Supabase `profiles` table.
"""

from fastapi import APIRouter, HTTPException, Depends, status, Header
from pydantic import BaseModel, Field
from typing import Optional, List
from app.routes.users import get_current_user
from app.services.supabase_service import get_profile

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class CalorieRequest(BaseModel):
    """Input for calorie calculation"""
    gender: str = Field(..., pattern="^(male|female)$")
    age: int = Field(..., ge=13, le=100)
    height: float = Field(..., ge=100, le=250, description="Height in cm")
    weight: float = Field(..., ge=30, le=300, description="Weight in kg")
    activity_level: str = Field(
        ...,
        pattern="^(sedentary|light|moderate|active|very_active)$",
        description="Activity level"
    )
    goal: str = Field(..., pattern="^(lose_weight|build_muscle|maintain)$")


class CalorieResponse(BaseModel):
    bmr: float
    tdee: float
    target_calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    goal: str
    bmi: float
    bmi_category: str


class MealItem(BaseModel):
    name: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    portion: str


class DayMeals(BaseModel):
    day: str
    breakfast: MealItem
    morning_snack: MealItem
    lunch: MealItem
    afternoon_snack: MealItem
    dinner: MealItem
    total_calories: int


class NutritionPlanResponse(BaseModel):
    plan_name: str
    daily_calories: int
    weekly_plan: List[DayMeals]
    tips: List[str]
    foods_to_eat: List[str]
    foods_to_avoid: List[str]


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_calories(data: CalorieRequest) -> CalorieResponse:
    """
    Calculate BMR, TDEE, and macros using Mifflin-St Jeor Equation.
    """
    # BMR (Mifflin-St Jeor)
    if data.gender == "male":
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
    else:
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161

    # Activity multipliers
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    tdee = bmr * activity_multipliers[data.activity_level]

    # Adjust target based on goal
    if data.goal == "lose_weight":
        target = tdee - 500   # ~0.5kg/week deficit
    elif data.goal == "build_muscle":
        target = tdee + 300   # lean bulk surplus
    else:
        target = tdee

    # Macro split
    if data.goal == "lose_weight":
        protein_pct, carbs_pct, fat_pct = 0.35, 0.35, 0.30
    elif data.goal == "build_muscle":
        protein_pct, carbs_pct, fat_pct = 0.30, 0.45, 0.25
    else:
        protein_pct, carbs_pct, fat_pct = 0.25, 0.50, 0.25

    protein_g = (target * protein_pct) / 4
    carbs_g = (target * carbs_pct) / 4
    fat_g = (target * fat_pct) / 9

    # BMI
    height_m = data.height / 100
    bmi = data.weight / (height_m ** 2)
    if bmi < 18.5:
        bmi_category = "Underweight"
    elif bmi < 25:
        bmi_category = "Normal weight"
    elif bmi < 30:
        bmi_category = "Overweight"
    else:
        bmi_category = "Obese"

    return CalorieResponse(
        bmr=round(bmr, 1),
        tdee=round(tdee, 1),
        target_calories=round(target, 1),
        protein_g=round(protein_g, 1),
        carbs_g=round(carbs_g, 1),
        fat_g=round(fat_g, 1),
        goal=data.goal,
        bmi=round(bmi, 1),
        bmi_category=bmi_category,
    )


def generate_nutrition_plan(calories: float, goal: str, gender: str) -> NutritionPlanResponse:
    """
    Generate a 7-day personalized nutrition plan based on calorie target and goal.
    """
    cal = int(calories)

    # Meal calorie distribution: 25% / 10% / 35% / 10% / 20%
    b_cal = int(cal * 0.25)
    ms_cal = int(cal * 0.10)
    l_cal = int(cal * 0.35)
    as_cal = int(cal * 0.10)
    d_cal = int(cal * 0.20)

    if goal == "lose_weight":
        plan_name = "Fat Loss Nutrition Plan"
        weekly_meals = [
            ("Monday",
             MealItem(name="Greek yogurt with berries & chia seeds", calories=b_cal, protein_g=18, carbs_g=30, fat_g=5, portion="200g yogurt + 100g berries"),
             MealItem(name="Apple with almond butter", calories=ms_cal, protein_g=3, carbs_g=20, fat_g=4, portion="1 apple + 1 tbsp"),
             MealItem(name="Grilled chicken salad with quinoa", calories=l_cal, protein_g=40, carbs_g=45, fat_g=12, portion="150g chicken + 80g quinoa"),
             MealItem(name="Celery & hummus", calories=as_cal, protein_g=4, carbs_g=12, fat_g=5, portion="4 sticks + 3 tbsp"),
             MealItem(name="Baked salmon with steamed broccoli", calories=d_cal, protein_g=35, carbs_g=15, fat_g=10, portion="150g salmon + 200g broccoli")),
            ("Tuesday",
             MealItem(name="Oat porridge with banana & walnuts", calories=b_cal, protein_g=12, carbs_g=55, fat_g=8, portion="80g oats + 1 banana"),
             MealItem(name="Handful of mixed nuts", calories=ms_cal, protein_g=5, carbs_g=6, fat_g=9, portion="30g"),
             MealItem(name="Turkey & veggie wrap (whole wheat)", calories=l_cal, protein_g=35, carbs_g=50, fat_g=10, portion="1 large wrap"),
             MealItem(name="Orange & low-fat cheese", calories=as_cal, protein_g=6, carbs_g=15, fat_g=4, portion="1 orange + 30g cheese"),
             MealItem(name="Stir-fried tofu with brown rice", calories=d_cal, protein_g=22, carbs_g=40, fat_g=8, portion="150g tofu + 150g rice")),
            ("Wednesday",
             MealItem(name="Scrambled eggs with spinach & toast", calories=b_cal, protein_g=20, carbs_g=28, fat_g=10, portion="3 eggs + 2 toast slices"),
             MealItem(name="Protein shake (low-carb)", calories=ms_cal, protein_g=20, carbs_g=5, fat_g=2, portion="1 scoop"),
             MealItem(name="Lentil soup with whole-grain bread", calories=l_cal, protein_g=22, carbs_g=60, fat_g=6, portion="300ml soup + 2 slices"),
             MealItem(name="Cucumber & tzatziki", calories=as_cal, protein_g=4, carbs_g=8, fat_g=3, portion="1 cucumber + 4 tbsp"),
             MealItem(name="Grilled tuna with sweet potato mash", calories=d_cal, protein_g=33, carbs_g=30, fat_g=5, portion="120g tuna + 150g potato")),
            ("Thursday",
             MealItem(name="Smoothie bowl (banana, spinach, protein)", calories=b_cal, protein_g=20, carbs_g=45, fat_g=5, portion="1 bowl"),
             MealItem(name="Rice cakes with avocado", calories=ms_cal, protein_g=2, carbs_g=18, fat_g=7, portion="2 cakes + 1/4 avocado"),
             MealItem(name="Chicken & vegetable stir-fry with noodles", calories=l_cal, protein_g=38, carbs_g=55, fat_g=8, portion="150g chicken + 100g noodles"),
             MealItem(name="Boiled egg & cherry tomatoes", calories=as_cal, protein_g=7, carbs_g=5, fat_g=5, portion="2 eggs + 10 tomatoes"),
             MealItem(name="Baked cod with asparagus & quinoa", calories=d_cal, protein_g=30, carbs_g=25, fat_g=6, portion="150g cod + 150g asparagus")),
            ("Friday",
             MealItem(name="Whole-grain pancakes with honey & fruit", calories=b_cal, protein_g=10, carbs_g=60, fat_g=5, portion="3 small pancakes"),
             MealItem(name="Skyr with granola", calories=ms_cal, protein_g=10, carbs_g=18, fat_g=2, portion="150g skyr + 30g granola"),
             MealItem(name="Tuna niçoise salad", calories=l_cal, protein_g=35, carbs_g=30, fat_g=15, portion="1 large plate"),
             MealItem(name="Edamame pods", calories=as_cal, protein_g=8, carbs_g=10, fat_g=4, portion="100g"),
             MealItem(name="Turkey meatballs with zucchini noodles", calories=d_cal, protein_g=32, carbs_g=18, fat_g=9, portion="200g meatballs + 200g zucchini")),
            ("Saturday",
             MealItem(name="Avocado toast with poached eggs", calories=b_cal, protein_g=18, carbs_g=28, fat_g=16, portion="2 eggs + 1 slice + 1/2 avocado"),
             MealItem(name="Protein bar (low sugar)", calories=ms_cal, protein_g=15, carbs_g=20, fat_g=5, portion="1 bar"),
             MealItem(name="Grilled shrimp with couscous salad", calories=l_cal, protein_g=35, carbs_g=50, fat_g=8, portion="200g shrimp + 100g couscous"),
             MealItem(name="Watermelon chunks", calories=as_cal, protein_g=1, carbs_g=22, fat_g=0, portion="300g"),
             MealItem(name="Beef steak (lean) with roasted vegetables", calories=d_cal, protein_g=38, carbs_g=20, fat_g=10, portion="150g steak + 200g veg")),
            ("Sunday",
             MealItem(name="Chia pudding with mango & coconut milk", calories=b_cal, protein_g=8, carbs_g=40, fat_g=10, portion="250ml"),
             MealItem(name="Pear & cottage cheese", calories=ms_cal, protein_g=8, carbs_g=18, fat_g=3, portion="1 pear + 100g cottage cheese"),
             MealItem(name="Chickpea & spinach curry with rice", calories=l_cal, protein_g=18, carbs_g=70, fat_g=8, portion="300g curry + 150g rice"),
             MealItem(name="Handful of grapes & walnuts", calories=as_cal, protein_g=3, carbs_g=20, fat_g=6, portion="100g grapes + 20g walnuts"),
             MealItem(name="Grilled chicken thigh with green beans", calories=d_cal, protein_g=34, carbs_g=12, fat_g=10, portion="150g chicken + 200g beans")),
        ]
        tips = [
            "Drink 2-3 liters of water daily to boost metabolism.",
            "Eat slowly — it takes 20 minutes for your brain to register fullness.",
            "Prioritize high-volume, low-calorie foods like leafy greens and cucumbers.",
            "Avoid liquid calories (sodas, juices) — they don't satisfy hunger.",
            "Eat protein at every meal to preserve muscle while losing fat.",
        ]
        foods_to_eat = ["Lean meats", "Leafy greens", "Berries", "Eggs", "Greek yogurt", "Legumes", "Quinoa", "Salmon"]
        foods_to_avoid = ["Fried foods", "Sugary drinks", "White bread", "Processed snacks", "Alcohol", "Full-fat dairy (excess)"]

    elif goal == "build_muscle":
        plan_name = "Muscle Building Nutrition Plan"
        weekly_meals = [
            ("Monday",
             MealItem(name="5-egg omelet with cheese & vegetables", calories=b_cal, protein_g=35, carbs_g=15, fat_g=22, portion="5 eggs + 50g cheese"),
             MealItem(name="Mass gainer shake + banana", calories=ms_cal, protein_g=25, carbs_g=50, fat_g=5, portion="1 scoop + 1 banana"),
             MealItem(name="Chicken breast with pasta & tomato sauce", calories=l_cal, protein_g=50, carbs_g=80, fat_g=10, portion="200g chicken + 200g pasta"),
             MealItem(name="Rice cakes with peanut butter", calories=as_cal, protein_g=8, carbs_g=30, fat_g=10, portion="3 cakes + 2 tbsp"),
             MealItem(name="Beef & sweet potato stew", calories=d_cal, protein_g=40, carbs_g=50, fat_g=12, portion="200g beef + 200g potato")),
            ("Tuesday",
             MealItem(name="Overnight oats with protein powder & nuts", calories=b_cal, protein_g=30, carbs_g=70, fat_g=12, portion="100g oats + 1 scoop protein"),
             MealItem(name="Tuna on whole-grain crackers", calories=ms_cal, protein_g=20, carbs_g=22, fat_g=5, portion="1 can tuna + 5 crackers"),
             MealItem(name="Salmon with brown rice & broccoli", calories=l_cal, protein_g=45, carbs_g=75, fat_g=15, portion="200g salmon + 200g rice"),
             MealItem(name="Greek yogurt with honey & granola", calories=as_cal, protein_g=15, carbs_g=35, fat_g=6, portion="200g yogurt + 40g granola"),
             MealItem(name="Chicken stir-fry with noodles & peanut sauce", calories=d_cal, protein_g=38, carbs_g=65, fat_g=14, portion="200g chicken + 150g noodles")),
            ("Wednesday",
             MealItem(name="French toast with eggs & maple syrup", calories=b_cal, protein_g=25, carbs_g=65, fat_g=12, portion="3 slices + 3 eggs"),
             MealItem(name="Cottage cheese with pineapple", calories=ms_cal, protein_g=18, carbs_g=28, fat_g=3, portion="200g cottage cheese"),
             MealItem(name="Beef burrito bowl (rice, beans, beef)", calories=l_cal, protein_g=48, carbs_g=85, fat_g=14, portion="1 large bowl"),
             MealItem(name="Protein bar + apple", calories=as_cal, protein_g=20, carbs_g=40, fat_g=6, portion="1 bar + 1 apple"),
             MealItem(name="Turkey mince with whole wheat pasta", calories=d_cal, protein_g=42, carbs_g=60, fat_g=10, portion="200g turkey + 200g pasta")),
            ("Thursday",
             MealItem(name="Smoothie: oats, banana, milk, protein, PB", calories=b_cal, protein_g=35, carbs_g=75, fat_g=15, portion="500ml"),
             MealItem(name="Hard-boiled eggs & whole grain toast", calories=ms_cal, protein_g=18, carbs_g=22, fat_g=10, portion="3 eggs + 2 slices"),
             MealItem(name="Grilled chicken wrap with avocado & rice", calories=l_cal, protein_g=45, carbs_g=70, fat_g=18, portion="1 large wrap + 100g rice"),
             MealItem(name="Mixed nuts & dried fruit", calories=as_cal, protein_g=6, carbs_g=30, fat_g=14, portion="50g"),
             MealItem(name="Pan-fried tuna steak with mashed potato", calories=d_cal, protein_g=40, carbs_g=55, fat_g=10, portion="180g tuna + 250g potato")),
            ("Friday",
             MealItem(name="Whole-grain waffles with eggs & turkey bacon", calories=b_cal, protein_g=30, carbs_g=60, fat_g=14, portion="2 waffles + 4 strips"),
             MealItem(name="Whey protein shake with whole milk", calories=ms_cal, protein_g=28, carbs_g=20, fat_g=8, portion="300ml shake"),
             MealItem(name="Pork tenderloin with quinoa & roasted veg", calories=l_cal, protein_g=42, carbs_g=75, fat_g=12, portion="200g pork + 150g quinoa"),
             MealItem(name="Banana & peanut butter on rice cakes", calories=as_cal, protein_g=5, carbs_g=40, fat_g=10, portion="2 cakes + 1 banana"),
             MealItem(name="Lamb chops with couscous & roasted peppers", calories=d_cal, protein_g=38, carbs_g=55, fat_g=16, portion="200g lamb + 150g couscous")),
            ("Saturday",
             MealItem(name="Pancake stack: protein powder, oats, egg whites", calories=b_cal, protein_g=35, carbs_g=70, fat_g=8, portion="5 pancakes"),
             MealItem(name="Ricotta on toast with honey", calories=ms_cal, protein_g=12, carbs_g=35, fat_g=8, portion="2 slices + 100g ricotta"),
             MealItem(name="Chicken fried rice (brown rice, egg, veg)", calories=l_cal, protein_g=40, carbs_g=80, fat_g=12, portion="1 large bowl"),
             MealItem(name="Edamame & miso soup", calories=as_cal, protein_g=10, carbs_g=18, fat_g=4, portion="100g edamame + 1 bowl soup"),
             MealItem(name="Beef steak with jacket potato & salad", calories=d_cal, protein_g=45, carbs_g=60, fat_g=14, portion="200g steak + 1 large potato")),
            ("Sunday",
             MealItem(name="Egg white scramble with oats & fruit", calories=b_cal, protein_g=28, carbs_g=65, fat_g=6, portion="6 egg whites + 100g oats"),
             MealItem(name="Protein shake & a handful of almonds", calories=ms_cal, protein_g=25, carbs_g=10, fat_g=14, portion="1 scoop + 30g almonds"),
             MealItem(name="Grilled salmon & sweet potato with spinach", calories=l_cal, protein_g=42, carbs_g=65, fat_g=14, portion="200g salmon + 200g potato"),
             MealItem(name="Yogurt parfait with berries & hemp seeds", calories=as_cal, protein_g=12, carbs_g=28, fat_g=6, portion="200g yogurt"),
             MealItem(name="Chicken casserole with white beans & tomato", calories=d_cal, protein_g=40, carbs_g=50, fat_g=10, portion="1 large bowl")),
        ]
        tips = [
            "Eat every 3-4 hours to keep muscles fueled and in an anabolic state.",
            "Consume 25-40g protein within 45 minutes post-workout.",
            "Don't skip carbs — they fuel performance and glycogen replenishment.",
            "Aim for 1.6-2.2g of protein per kg of bodyweight daily.",
            "Sleep 7-9 hours — growth hormone peaks during deep sleep.",
        ]
        foods_to_eat = ["Chicken breast", "Eggs", "Salmon", "Lean beef", "Whole milk", "Oats", "Brown rice", "Sweet potato", "Avocado", "Nuts"]
        foods_to_avoid = ["Excessive alcohol", "Ultra-processed foods", "Refined sugar", "Fast food (regularly)", "Diet sodas (they suppress appetite)"]

    else:  # maintain
        plan_name = "Maintenance & Balanced Nutrition Plan"
        weekly_meals = [
            ("Monday",
             MealItem(name="Granola with milk, fresh berries & honey", calories=b_cal, protein_g=12, carbs_g=55, fat_g=8, portion="80g granola + 200ml milk"),
             MealItem(name="Banana & almond butter", calories=ms_cal, protein_g=4, carbs_g=28, fat_g=8, portion="1 banana + 1 tbsp"),
             MealItem(name="Mediterranean chicken wrap with feta", calories=l_cal, protein_g=35, carbs_g=55, fat_g=14, portion="1 large wrap"),
             MealItem(name="Trail mix (nuts, seeds, dried fruit)", calories=as_cal, protein_g=5, carbs_g=22, fat_g=10, portion="40g"),
             MealItem(name="Pasta arrabiata with grilled chicken", calories=d_cal, protein_g=32, carbs_g=60, fat_g=10, portion="200g pasta + 120g chicken")),
            ("Tuesday",
             MealItem(name="Avocado toast with smoked salmon & egg", calories=b_cal, protein_g=22, carbs_g=30, fat_g=18, portion="2 slices + 60g salmon + 1 egg"),
             MealItem(name="Orange & pistachio nuts", calories=ms_cal, protein_g=5, carbs_g=20, fat_g=7, portion="1 orange + 25g nuts"),
             MealItem(name="Quinoa bowl with roasted veg & tahini", calories=l_cal, protein_g=18, carbs_g=65, fat_g=14, portion="1 large bowl"),
             MealItem(name="Greek yogurt with seeds", calories=as_cal, protein_g=10, carbs_g=12, fat_g=5, portion="150g yogurt"),
             MealItem(name="Grilled sea bass with roasted potatoes", calories=d_cal, protein_g=30, carbs_g=45, fat_g=10, portion="150g fish + 200g potatoes")),
            ("Wednesday",
             MealItem(name="Bircher muesli with grated apple & yogurt", calories=b_cal, protein_g=14, carbs_g=60, fat_g=7, portion="100g muesli + 100g yogurt"),
             MealItem(name="Handful of mixed berries & cashews", calories=ms_cal, protein_g=4, carbs_g=20, fat_g=7, portion="100g berries + 20g cashews"),
             MealItem(name="Lentil & spinach dhal with naan", calories=l_cal, protein_g=20, carbs_g=70, fat_g=8, portion="1 bowl + 1 naan"),
             MealItem(name="Hummus with pitta & carrot sticks", calories=as_cal, protein_g=6, carbs_g=25, fat_g=5, portion="3 tbsp hummus + 1 pitta"),
             MealItem(name="Chicken thigh with roasted root vegetables", calories=d_cal, protein_g=32, carbs_g=40, fat_g=14, portion="150g chicken + 250g veg")),
            ("Thursday",
             MealItem(name="Peanut butter & banana on whole-grain toast", calories=b_cal, protein_g=12, carbs_g=60, fat_g=12, portion="2 slices + 2 tbsp PB"),
             MealItem(name="Kiwi & low-fat cheese slice", calories=ms_cal, protein_g=6, carbs_g=15, fat_g=5, portion="2 kiwis + 30g cheese"),
             MealItem(name="Beef & vegetable stir-fry with jasmine rice", calories=l_cal, protein_g=35, carbs_g=65, fat_g=12, portion="150g beef + 150g rice"),
             MealItem(name="Dark chocolate & almonds", calories=as_cal, protein_g=3, carbs_g=18, fat_g=10, portion="20g choc + 20g almonds"),
             MealItem(name="Baked trout with new potatoes & peas", calories=d_cal, protein_g=30, carbs_g=40, fat_g=10, portion="150g trout + 200g potatoes")),
            ("Friday",
             MealItem(name="Shakshuka (eggs in tomato sauce) with bread", calories=b_cal, protein_g=18, carbs_g=35, fat_g=12, portion="2 eggs + 2 slices"),
             MealItem(name="Smoothie: strawberry, banana, oat milk", calories=ms_cal, protein_g=5, carbs_g=35, fat_g=3, portion="300ml"),
             MealItem(name="Grilled halloumi & roasted veg couscous", calories=l_cal, protein_g=22, carbs_g=55, fat_g=18, portion="100g halloumi + 150g couscous"),
             MealItem(name="Apple slices with brie", calories=as_cal, protein_g=5, carbs_g=18, fat_g=8, portion="1 apple + 30g brie"),
             MealItem(name="Thai green curry with jasmine rice", calories=d_cal, protein_g=30, carbs_g=55, fat_g=12, portion="1 bowl + 150g rice")),
            ("Saturday",
             MealItem(name="Full English (eggs, turkey sausage, beans, tomato)", calories=b_cal, protein_g=28, carbs_g=40, fat_g=16, portion="2 eggs + 2 sausages"),
             MealItem(name="Protein flapjack & coffee", calories=ms_cal, protein_g=10, carbs_g=35, fat_g=7, portion="1 flapjack bar"),
             MealItem(name="Caesar salad with grilled chicken & croutons", calories=l_cal, protein_g=38, carbs_g=30, fat_g=18, portion="1 large plate"),
             MealItem(name="Melon & prosciutto", calories=as_cal, protein_g=7, carbs_g=15, fat_g=3, portion="1/4 melon + 4 slices"),
             MealItem(name="Roast chicken with vegetables & gravy", calories=d_cal, protein_g=38, carbs_g=40, fat_g=12, portion="200g chicken + 250g veg")),
            ("Sunday",
             MealItem(name="Smashed avocado, feta & tomato on rye", calories=b_cal, protein_g=12, carbs_g=32, fat_g=16, portion="2 slices rye + 1/2 avocado"),
             MealItem(name="Dried mango & sunflower seeds", calories=ms_cal, protein_g=3, carbs_g=28, fat_g=5, portion="50g mango + 15g seeds"),
             MealItem(name="Mushroom risotto with parmesan", calories=l_cal, protein_g=18, carbs_g=70, fat_g=12, portion="1 large bowl"),
             MealItem(name="Celery, apple & walnut bites", calories=as_cal, protein_g=2, carbs_g=15, fat_g=8, portion="2 stalks + 1/2 apple + 15g walnuts"),
             MealItem(name="Pan-fried salmon with lemon orzo pasta", calories=d_cal, protein_g=32, carbs_g=50, fat_g=12, portion="150g salmon + 150g orzo")),
        ]
        tips = [
            "Consistency beats perfection — stick to your plan 80-90% of the time.",
            "Prep meals on Sundays to stay on track during the busy week.",
            "Vary your protein sources for a full amino acid profile.",
            "Monitor portions visually: palm = protein, fist = carbs, thumb = fat.",
            "Enjoy occasional treats mindfully — deprivation leads to bingeing.",
        ]
        foods_to_eat = ["Whole grains", "Colorful vegetables", "Lean proteins", "Healthy fats", "Legumes", "Fruits", "Fermented foods"]
        foods_to_avoid = ["Ultra-processed snacks", "Excess sodium", "Trans fats", "Excessive sugar", "Binge drinking"]

    # Build DayMeals objects
    day_plans = []
    for (day, b, ms, l, a_s, d) in weekly_meals:
        total = b.calories + ms.calories + l.calories + a_s.calories + d.calories
        day_plans.append(DayMeals(
            day=day,
            breakfast=b,
            morning_snack=ms,
            lunch=l,
            afternoon_snack=a_s,
            dinner=d,
            total_calories=total,
        ))

    return NutritionPlanResponse(
        plan_name=plan_name,
        daily_calories=cal,
        weekly_plan=day_plans,
        tips=tips,
        foods_to_eat=foods_to_eat,
        foods_to_avoid=foods_to_avoid,
    )


# ============================================================================
# ROUTER
# ============================================================================

router = APIRouter(
    prefix="/nutrition",
    tags=["Nutrition"],
)


@router.post("/calculate", response_model=CalorieResponse)
async def calculate_calories_endpoint(
    data: CalorieRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Calculate BMR, TDEE, and target macros based on user metrics.
    Requires authentication.
    """
    try:
        return calculate_calories(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plan", response_model=NutritionPlanResponse)
async def generate_plan_endpoint(
    data: CalorieRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate a full 7-day personalized nutrition plan.
    Requires authentication.
    """
    try:
        result = calculate_calories(data)
        plan = generate_nutrition_plan(result.target_calories, data.goal, data.gender)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calculate-public", response_model=CalorieResponse)
async def calculate_calories_public(data: CalorieRequest):
    """
    Public endpoint — no auth required.
    Useful for the frontend calorie preview before login.
    """
    try:
        return calculate_calories(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plan-public", response_model=NutritionPlanResponse)
async def generate_plan_public(data: CalorieRequest):
    """
    Public endpoint for full plan generation — no auth required.
    """
    try:
        result = calculate_calories(data)
        plan = generate_nutrition_plan(result.target_calories, data.goal, data.gender)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# DB-POWERED ENDPOINTS  (read profile from Supabase `profiles` table)
# ============================================================================

class ProfileSummaryResponse(BaseModel):
    """Subset of the profiles table fields needed for nutrition calculations."""
    gender: str
    age: int
    height: float
    weight: float
    fitness_goal: str
    full_name: Optional[str] = None
    training_days_per_week: Optional[int] = None
    preferred_workout_duration: Optional[int] = None


class AutoCalorieResponse(BaseModel):
    """Calorie result enriched with the profile data that was used."""
    profile: ProfileSummaryResponse
    calories: CalorieResponse


class AutoPlanResponse(BaseModel):
    """Plan result enriched with the profile data that was used."""
    profile: ProfileSummaryResponse
    calories: CalorieResponse
    plan: NutritionPlanResponse


def _profile_to_request(profile: dict, activity_level: str = "moderate") -> CalorieRequest:
    """
    Convert a raw Supabase profile row into a CalorieRequest.

    Maps the DB column `fitness_goal` → CalorieRequest.goal.
    Falls back to sensible defaults for any missing fields.
    """
    gender = profile.get("gender") or "male"
    if gender not in ("male", "female"):
        gender = "male"

    goal = profile.get("fitness_goal") or "maintain"
    if goal not in ("lose_weight", "build_muscle", "maintain"):
        goal = "maintain"

    return CalorieRequest(
        gender=gender,
        age=int(profile.get("age") or 25),
        height=float(profile.get("height") or 170),
        weight=float(profile.get("weight") or 70),
        activity_level=activity_level,
        goal=goal,
    )


def _build_profile_summary(profile: dict) -> ProfileSummaryResponse:
    return ProfileSummaryResponse(
        gender=profile.get("gender") or "male",
        age=int(profile.get("age") or 25),
        height=float(profile.get("height") or 170),
        weight=float(profile.get("weight") or 70),
        fitness_goal=profile.get("fitness_goal") or "maintain",
        full_name=profile.get("full_name"),
        training_days_per_week=profile.get("training_days_per_week"),
        preferred_workout_duration=profile.get("preferred_workout_duration"),
    )


@router.get("/from-profile", response_model=AutoCalorieResponse)
async def calories_from_profile(
    activity_level: str = "moderate",
    current_user: dict = Depends(get_current_user),
):
    """
    Fetch the user's profile from the `profiles` table, then automatically
    calculate their BMR / TDEE / macros.

    Query param:
      - activity_level: sedentary | light | moderate | active | very_active
                        (default: moderate)

    Returns the profile data that was used alongside the calorie results so the
    frontend can display them without a separate profile fetch.
    """
    if activity_level not in ("sedentary", "light", "moderate", "active", "very_active"):
        raise HTTPException(status_code=422, detail="Invalid activity_level value")

    user_id = current_user["id"]
    profile = get_profile(user_id)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please complete onboarding first."
        )

    req = _profile_to_request(profile, activity_level)
    calorie_result = calculate_calories(req)

    return AutoCalorieResponse(
        profile=_build_profile_summary(profile),
        calories=calorie_result,
    )


@router.get("/plan-from-profile", response_model=AutoPlanResponse)
async def plan_from_profile(
    activity_level: str = "moderate",
    current_user: dict = Depends(get_current_user),
):
    """
    Fetch the user's profile from the `profiles` table, calculate their calories,
    and generate a full 7-day personalized nutrition plan — all in one call.

    Query param:
      - activity_level: sedentary | light | moderate | active | very_active
                        (default: moderate)
    """
    if activity_level not in ("sedentary", "light", "moderate", "active", "very_active"):
        raise HTTPException(status_code=422, detail="Invalid activity_level value")

    user_id = current_user["id"]
    profile = get_profile(user_id)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please complete onboarding first."
        )

    req = _profile_to_request(profile, activity_level)
    calorie_result = calculate_calories(req)
    plan = generate_nutrition_plan(calorie_result.target_calories, req.goal, req.gender)

    return AutoPlanResponse(
        profile=_build_profile_summary(profile),
        calories=calorie_result,
        plan=plan,
    )