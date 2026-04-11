import { create } from 'zustand'

export type Language = 'en' | 'ar'

interface I18nState {
  language: Language
  isRTL: boolean
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.rememberMe': 'Remember me',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.welcomeBack': 'Welcome back! Please sign in to continue.',
    'auth.joinAIFitnessTrainer': 'Join AI Fitness Trainer',
    'auth.createAccountDescription': 'Create your account to start your AI-powered fitness journey.',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.workouts': 'Workouts',
    'nav.liveTraining': 'Live Training',
    'nav.reports': 'Reports',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.totalSessions': 'Total Sessions',
    'dashboard.workoutStreak': 'Workout Streak',
    'dashboard.recentSessions': 'Recent Sessions',
    'dashboard.viewAll': 'View All',
    'dashboard.completed': 'Completed',
    'dashboard.weeklyActivity': 'Weekly Activity',
    'dashboard.progressOverTime': 'Progress Over Time',
    'dashboard.thisWeek': 'This Week',
    'dashboard.lastWeek': 'Last Week',
    'dashboard.thisMonth': 'This Month',
    'dashboard.sessions': 'Sessions',
    'dashboard.duration': 'Duration',
    'dashboard.welcomeMessage': 'Ready to start your AI-powered training session?',
    'dashboard.startTraining': 'Start Training',
    
    // Onboarding
    'onboarding.welcome': 'Welcome to AI Fitness Trainer',
    'onboarding.gender': 'Gender',
    'onboarding.age': 'Age',
    'onboarding.height': 'Height (cm)',
    'onboarding.weight': 'Weight (kg)',
    'onboarding.fitnessGoal': 'Fitness Goal',
    'onboarding.loseWeight': 'Lose Weight',
    'onboarding.buildMuscle': 'Build Muscle',
    'onboarding.maintainFitness': 'Maintain Fitness',
    'onboarding.trainingDays': 'Training Days per Week',
    'onboarding.workoutDuration': 'Preferred Workout Duration (minutes)',
    'onboarding.next': 'Next',
    'onboarding.previous': 'Previous',
    'onboarding.complete': 'Complete Setup',
    
    // Live Training
    'liveTraining.title': 'Live AI Training',
    'liveTraining.description': 'Real-time movement analysis and personalized coaching',
    'liveTraining.uploadVideo': 'Upload Video',
    'liveTraining.startTraining': 'Start Training',
    'liveTraining.analyzingVideo': 'Analyzing Video...',
    'liveTraining.processingForm': 'AI is processing your workout form',
    'liveTraining.live': 'LIVE',
    'liveTraining.cameraDisabled': 'Camera Disabled',
    'liveTraining.enableCamera': 'Enable Camera',
    'liveTraining.or': 'or',
    'liveTraining.uploadVideoAnalysis': 'Upload Video for Analysis',
    'liveTraining.time': 'Time',
    'liveTraining.exercise': 'Exercise',
    'liveTraining.aiFeedback': 'AI Feedback',
    'liveTraining.startTrainingFeedback': 'Start training to receive AI feedback',
    'liveTraining.cameraError': 'Error accessing camera. Please check permissions.',
    'liveTraining.sessionCompleted': 'Training session completed and saved to reports!',
    
    // Exercises
    'exercises.pushups': 'Push-ups',
    'exercises.squats': 'Squats',
    'exercises.situps': 'Sit-ups',
    
    // Reports
    'reports.title': 'Reports',
    'reports.description': 'Track your progress and analyze your performance',
    'reports.exportReport': 'Export Report',
    'reports.totalSessions': 'Total Sessions',
    'reports.totalMinutes': 'Total Minutes',
    'reports.averageAccuracy': 'Average Accuracy',
    'reports.recentSessions': 'Recent Sessions',
    'reports.date': 'Date',
    'reports.workoutType': 'Workout Type',
    'reports.duration': 'Duration',
    'reports.minutes': 'minutes',
    'reports.actions': 'Actions',
    'reports.viewAll': 'View All',
    'reports.noSessionsYet': 'No training sessions yet. Start your first workout!',
    'reports.detailedFeedback': 'Detailed Feedback',
    'reports.timeline': 'Timeline',
    'reports.issue': 'Issue',
    'reports.feedbackDescription': 'Description',
    'reports.improvement': 'How to Improve',
    'reports.commonMistakes': 'Common Mistakes',
    'reports.areasOfImprovement': 'Areas of Improvement',
    'reports.aiSuggestions': 'AI Suggestions',
    'reports.howToFix': 'How to Fix',
    'reports.aiReasoning': 'AI Reasoning',
    'reports.viewDetails': 'View Details',
    'reports.backToReports': 'Back to Reports',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  ar: {
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.name': 'الاسم الكامل',
    'auth.rememberMe': 'تذكرني',
    'auth.dontHaveAccount': 'ليس لديك حساب؟',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.welcomeBack': 'مرحباً بعودتك! يرجى تسجيل الدخول للمتابعة.',
    'auth.joinAIFitnessTrainer': 'انضم إلى مدرب اللياقة الذكي',
    'auth.createAccountDescription': 'أنشئ حسابك لبدء رحلة اللياقة المدعومة بالذكاء الاصطناعي.',
    
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.workouts': 'التمارين',
    'nav.liveTraining': 'التدريب المباشر',
    'nav.reports': 'التقارير',
    'nav.profile': 'الملف الشخصي',
    'nav.settings': 'الإعدادات',
    
    // Dashboard
    'dashboard.totalSessions': 'إجمالي الجلسات',
    'dashboard.workoutStreak': 'سلسلة التمارين',
    'dashboard.recentSessions': 'الجلسات الأخيرة',
    'dashboard.viewAll': 'عرض الكل',
    'dashboard.completed': 'مكتمل',
    'dashboard.weeklyActivity': 'النشاط الأسبوعي',
    'dashboard.progressOverTime': 'التقدم عبر الوقت',
    'dashboard.thisWeek': 'هذا الأسبوع',
    'dashboard.lastWeek': 'الأسبوع الماضي',
    'dashboard.thisMonth': 'هذا الشهر',
    'dashboard.sessions': 'الجلسات',
    'dashboard.duration': 'المدة',
    'dashboard.welcomeMessage': 'مستعد لبدء جلسة التدريب المدعومة بالذكاء الاصطناعي؟',
    'dashboard.startTraining': 'بدء التدريب',
    
    // Onboarding
    'onboarding.welcome': 'مرحباً بك في مدرب اللياقة الذكي',
    'onboarding.gender': 'الجنس',
    'onboarding.age': 'العمر',
    'onboarding.height': 'الطول (سم)',
    'onboarding.weight': 'الوزن (كغ)',
    'onboarding.fitnessGoal': 'هدف اللياقة',
    'onboarding.loseWeight': 'فقدان الوزن',
    'onboarding.buildMuscle': 'بناء العضلات',
    'onboarding.maintainFitness': 'الحفاظ على اللياقة',
    'onboarding.trainingDays': 'أيام التدريب في الأسبوع',
    'onboarding.workoutDuration': 'مدة التمرين المفضلة (دقيقة)',
    'onboarding.next': 'التالي',
    'onboarding.previous': 'السابق',
    'onboarding.complete': 'إكمال الإعداد',
    
    // Live Training
    'liveTraining.title': 'التدريب المباشر بالذكاء الاصطناعي',
    'liveTraining.description': 'تحليل الحركة في الوقت الفعلي والتدريب الشخصي',
    'liveTraining.uploadVideo': 'رفع فيديو',
    'liveTraining.startTraining': 'بدء التدريب',
    'liveTraining.analyzingVideo': 'جاري تحليل الفيديو...',
    'liveTraining.processingForm': 'الذكاء الاصطناعي يحلل شكل التمرين',
    'liveTraining.live': 'مباشر',
    'liveTraining.cameraDisabled': 'الكاميرا معطلة',
    'liveTraining.enableCamera': 'تفعيل الكاميرا',
    'liveTraining.or': 'أو',
    'liveTraining.uploadVideoAnalysis': 'رفع فيديو للتحليل',
    'liveTraining.time': 'الوقت',
    'liveTraining.exercise': 'التمرين',
    'liveTraining.aiFeedback': 'ملاحظات الذكاء الاصطناعي',
    'liveTraining.startTrainingFeedback': 'ابدأ التدريب لتلقي ملاحظات الذكاء الاصطناعي',
    'liveTraining.cameraError': 'خطأ في الوصول للكاميرا. يرجى التحقق من الأذونات.',
    'liveTraining.sessionCompleted': 'تم إكمال جلسة التدريب وحفظها في التقارير!',
    
    // Exercises
    'exercises.pushups': 'تمارين الضغط',
    'exercises.squats': 'تمارين القرفصاء',
    'exercises.situps': 'تمارين البطن',
    
    // Reports
    'reports.title': 'التقارير',
    'reports.description': 'تتبع تقدمك وحلل أداءك',
    'reports.exportReport': 'تصدير التقرير',
    'reports.totalSessions': 'إجمالي الجلسات',
    'reports.totalMinutes': 'إجمالي الدقائق',
    'reports.averageAccuracy': 'متوسط الدقة',
    'reports.recentSessions': 'الجلسات الأخيرة',
    'reports.date': 'التاريخ',
    'reports.workoutType': 'نوع التمرين',
    'reports.duration': 'المدة',
    'reports.minutes': 'دقيقة',
    'reports.actions': 'الإجراءات',
    'reports.viewAll': 'عرض الكل',
    'reports.noSessionsYet': 'لا توجد جلسات تدريب بعد. ابدأ تمرينك الأول!',
    'reports.detailedFeedback': 'ملاحظات مفصلة',
    'reports.timeline': 'الجدول الزمني',
    'reports.issue': 'المشكلة',
    'reports.feedbackDescription': 'الوصف',
    'reports.improvement': 'كيفية التحسين',
    'reports.commonMistakes': 'الأخطاء الشائعة',
    'reports.areasOfImprovement': 'مجالات التحسين',
    'reports.aiSuggestions': 'اقتراحات الذكاء الاصطناعي',
    'reports.howToFix': 'كيفية الإصلاح',
    'reports.aiReasoning': 'تفسير الذكاء الاصطناعي',
    'reports.viewDetails': 'عرض التفاصيل',
    'reports.backToReports': 'العودة للتقارير',
    
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
  },
} as const

// Initialize language from localStorage
const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('i18n-language') as Language
    return stored && ['en', 'ar'].includes(stored) ? stored : 'en'
  }
  return 'en'
}

export const useI18nStore = create<I18nState>()((set, get) => {
  const initialLanguage = getInitialLanguage()
  
  // Set initial document direction
  if (typeof document !== 'undefined') {
    document.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr'
  }
  
  return {
    language: initialLanguage,
    isRTL: initialLanguage === 'ar',
    
    setLanguage: (language: Language) => {
      set({ 
        language, 
        isRTL: language === 'ar' 
      })
      if (typeof document !== 'undefined') {
        document.dir = language === 'ar' ? 'rtl' : 'ltr'
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('i18n-language', language)
      }
    },
    
    t: (key: string) => {
      const { language } = get()
      const translation = translations[language] as Record<string, string>
      return translation[key] || key
    },
  }
})