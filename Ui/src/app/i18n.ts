import { create } from 'zustand'
import { en } from '../translations/en'
import { ar } from '../translations/ar'

export type Language = 'en' | 'ar'

interface I18nState {
  language: Language
  isRTL: boolean
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en,
  ar,
} as const

// FIXED: Add Record<string, string> to allow string indexing
type TranslationsType = Record<string, Record<string, string>>;

// Initialize language from localStorage
const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('app-language') as Language
    return stored && ['en', 'ar'].includes(stored) ? stored : 'en'
  }
  return 'en'
}

// Apply language settings to document
const applyLanguageSettings = (language: Language) => {
  if (typeof document !== 'undefined') {
    const isRTL = language === 'ar'
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', language)
    
    // Apply Arabic font
    if (isRTL) {
      document.body.style.fontFamily = "'Cairo', 'Tajawal', sans-serif"
    } else {
      document.body.style.fontFamily = "'Inter', sans-serif"
    }
  }
}

export const useI18nStore = create<I18nState>()((set, get) => {
  const initialLanguage = getInitialLanguage()
  
  // Set initial document direction and font
  applyLanguageSettings(initialLanguage)
  
  return {
    language: initialLanguage,
    isRTL: initialLanguage === 'ar',
    
    setLanguage: (language: Language) => {
      set({ 
        language, 
        isRTL: language === 'ar' 
      })
      
      // Apply settings to document
      applyLanguageSettings(language)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-language', language)
      }
    },
    
    t: (key: string) => {
      const { language } = get()
      const translation = (translations as TranslationsType)[language] // FIXED: Cast to allow string indexing
      return translation[key] || (translations as TranslationsType).en[key] || key
    },
  }
})

// AI Feedback mapping for live training
export const aiFeedbackMap: Record<string, string> = {
  "Good Form": "aiFeedback.goodForm",
  "Straighten your back": "aiFeedback.straightenBack",
  "Bend elbows more (too straight)": "aiFeedback.bendElbowsMore",
  "Don't go too low (elbow too closed)": "aiFeedback.dontGoTooLow",
  "Keep chest up (too much forward lean)": "aiFeedback.keepChestUp",
  "Avoid rounding (keep back neutral)": "aiFeedback.avoidRounding",
  "Knees too far past toes": "aiFeedback.kneesPastToes",
  "Control depth (too deep/unstable)": "aiFeedback.controlDepth",
  "Curl up more (not enough range)": "aiFeedback.curlUpMore",
  "Don't pull your neck forward": "aiFeedback.dontPullNeck",
}

// Mistake type mapping for reports
export const mistakeTypeMap: Record<string, string> = {
  "back_not_straight": "mistake.backNotStraight",
  "elbows_too_straight": "mistake.elbowsTooStraight",
  "going_too_low": "mistake.goingTooLow",
  "forward_lean": "mistake.forwardLean",
  "rounded_back": "mistake.roundedBack",
  "knees_past_toes": "mistake.kneesPastToes",
  "depth_too_deep": "mistake.depthTooDeep",
  "insufficient_range": "mistake.insufficientRange",
  "neck_strain": "mistake.neckStrain",
  "form_issue": "mistake.formIssue",
}