/**
 * useVoiceFeedback Hook (IMPROVED VERSION)
 * 
 * Provides voice feedback for live training sessions using the Web Speech API.
 * 
 * KEY IMPROVEMENTS:
 * 1. Never interrupts mistake sentences mid-speech
 * 2. Only speaks "Good form" when meaningful (first time, after correction, or long cooldown)
 * 3. Tracks what TYPE of speech is playing to make smart interrupt decisions
 * 
 * ZERO backend changes, ZERO npm packages, ZERO API keys.
 * Pure browser Web Speech API.
 */

import { useState, useRef, useEffect, useCallback } from 'react'

// Cooldown constants
const SAME_MISTAKE_COOLDOWN_MS = 5000   // Don't repeat same mistake within 5 seconds
const GOOD_FORM_LONG_COOLDOWN_MS = 30000 // Only praise good form every 30 seconds if no mistakes
const RECENT_MISTAKE_WINDOW_MS = 10000   // Consider a mistake "recent" for 10 seconds

export interface UseVoiceFeedbackOptions {
  enabled: boolean           // User can turn voice on/off
  language: 'en' | 'ar'     // Matches app language setting
  rate?: number              // Speech speed, default 1.1
  volume?: number            // Speech volume, default 1.0
}

export interface UseVoiceFeedbackReturn {
  speak: (text: string, formStatus: 'good' | 'bad' | 'none') => void
  cancel: () => void
  reset: () => void          // NEW: Reset all state when session ends
  isSupported: boolean       // False if browser has no speech synthesis
  isSpeaking: boolean
  availableVoices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  setVoice: (voice: SpeechSynthesisVoice) => void
}

export function useVoiceFeedback(options: UseVoiceFeedbackOptions): UseVoiceFeedbackReturn {
  const { enabled, language, rate = 1.1, volume = 1.0 } = options

  // Check if browser supports Web Speech API
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // State for UI updates (these SHOULD cause re-renders)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  // ============================================================================
  // REFS FOR TRACKING (DO NOT use useState - these should NOT cause re-renders)
  // ============================================================================

  // What type of speech is currently playing
  const currentlyPlayingTypeRef = useRef<'mistake' | 'good_form' | 'none'>('none')

  // Reference to the active utterance object
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Last text spoken (any type)
  const lastSpokenTextRef = useRef<string>('')

  // Timestamp of last time ANY speech was started
  const lastSpokenTimeRef = useRef<number>(0)

  // Timestamp of when the last mistake was spoken
  const lastMistakeTimeRef = useRef<number>(0)

  // Timestamp of when good form was last spoken
  const lastGoodFormSpokenTimeRef = useRef<number>(0)

  // True if a mistake happened since the last "good form" utterance
  // Resets to false when we speak good form
  // Set to true when any mistake is spoken
  const mistakeHappenedSinceLastGoodFormRef = useRef<boolean>(false)

  // How many times good form has been spoken this session total
  const goodFormSpokenCountRef = useRef<number>(0)

  /**
   * Internal helper function that actually creates and plays the utterance
   */
  const speakUtterance = useCallback((text: string, type: 'mistake' | 'good_form') => {
    if (!isSupported) return

    // Cancel any existing speech
    try {
      window.speechSynthesis.cancel()
    } catch (err) {
      console.warn('Failed to cancel speech:', err)
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US'
    
    // Mistakes: slower, lower pitch (more serious tone)
    // Good form: faster, higher pitch (more encouraging tone)
    utterance.rate = type === 'mistake' ? 1.0 : rate
    utterance.pitch = type === 'mistake' ? 0.9 : 1.1
    utterance.volume = volume

    // Set voice if one is selected
    if (selectedVoice) {
      utterance.voice = selectedVoice
    } else {
      // Try to find a good default voice
      const voices = window.speechSynthesis.getVoices()
      const preferredLang = language === 'ar' ? 'ar' : 'en'
      const preferred = voices.find(v =>
        v.lang.startsWith(preferredLang) &&
        (v.name.includes('Google') || v.name.includes('Microsoft'))
      ) || voices.find(v => v.lang.startsWith(preferredLang))
      if (preferred) {
        utterance.voice = preferred
      }
    }

    // CRITICAL: Set currentlyPlayingTypeRef BEFORE calling speak()
    // The onstart callback fires async, but we need this set synchronously
    currentlyPlayingTypeRef.current = type
    currentUtteranceRef.current = utterance

    // Set up callbacks
    utterance.onstart = () => {
      setIsSpeaking(true)
      // Redundant but safe - ensure type is set
      currentlyPlayingTypeRef.current = type
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      currentlyPlayingTypeRef.current = 'none'
      currentUtteranceRef.current = null
    }

    utterance.onerror = (event) => {
      // IMPORTANT: Ignore 'interrupted' errors
      // These fire every time we call cancel() and are expected behavior
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.warn('Speech synthesis error:', event.error)
      }
      setIsSpeaking(false)
      currentlyPlayingTypeRef.current = 'none'
      currentUtteranceRef.current = null
    }

    // Speak!
    try {
      window.speechSynthesis.speak(utterance)
      lastSpokenTextRef.current = text
      lastSpokenTimeRef.current = Date.now()
    } catch (err) {
      console.warn('Failed to speak:', err)
      setIsSpeaking(false)
      currentlyPlayingTypeRef.current = 'none'
      currentUtteranceRef.current = null
    }
  }, [isSupported, language, rate, volume, selectedVoice])

  /**
   * Main speak function with intelligent interrupt logic
   */
  const speak = useCallback((text: string, formStatus: 'good' | 'bad' | 'none') => {
    // Step 1: Check if supported and enabled
    if (!isSupported || !enabled) return

    // Step 2: Skip non-coaching messages (technical status messages)
    const skipPhrases = [
      'buffering',
      'detecting',
      'position',
      'tracking',
      'analyzing',
      'waiting',
      'starting',
      'جاري',      // Arabic: "in progress"
      'اكتشاف',    // Arabic: "detecting"
      'تتبع',      // Arabic: "tracking"
      'انتظار',    // Arabic: "waiting"
      'تحليل',     // Arabic: "analyzing"
      'ضع'        // Arabic: "position"
    ]

    const textLower = text.toLowerCase()
    if (skipPhrases.some(phrase => textLower.includes(phrase))) return

    // Skip if formStatus is 'none'
    if (formStatus === 'none') return

    const now = Date.now()
    const isSpeaking = window.speechSynthesis.speaking
    const currentType = currentlyPlayingTypeRef.current

    // ═══════════════════════════════════════════════════════════════════════
    // CASE 1: Feedback is a BAD FORM mistake
    // ═══════════════════════════════════════════════════════════════════════
    if (formStatus === 'bad') {
      // Mark that a mistake occurred (used for good form logic later)
      mistakeHappenedSinceLastGoodFormRef.current = true
      lastMistakeTimeRef.current = now

      // Check if this exact mistake was JUST spoken (within 5 seconds)
      // Prevents repeating same mistake too fast
      const isSameMistake = text === lastSpokenTextRef.current
      const timeSinceLastSpeak = now - lastSpokenTimeRef.current
      
      if (isSameMistake && timeSinceLastSpeak < SAME_MISTAKE_COOLDOWN_MS) {
        return // Skip - same mistake spoken too recently
      }

      // CRITICAL RULE: If currently speaking a MISTAKE → do NOT interrupt
      // Let the current mistake sentence complete fully
      // This fixes Problem 1 - no more mid-sentence interruptions
      if (isSpeaking && currentType === 'mistake') {
        // The next frame will try again if form is still bad
        return
      }

      // If currently speaking GOOD FORM → cancel it (low priority)
      // Mistakes are more important than good form praise
      if (isSpeaking && currentType === 'good_form') {
        window.speechSynthesis.cancel()
      }

      // Speak the mistake
      speakUtterance(text, 'mistake')
      return
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CASE 2: Feedback is GOOD FORM
    // ═══════════════════════════════════════════════════════════════════════
    if (formStatus === 'good') {
      // CRITICAL RULE: NEVER interrupt a currently speaking mistake
      // This fixes Problem 1 - mistakes always complete
      if (isSpeaking && currentType === 'mistake') {
        return
      }

      // Was there a recent mistake? (within last 10 seconds)
      const recentMistake = (now - lastMistakeTimeRef.current) < RECENT_MISTAKE_WINDOW_MS

      // Has a mistake happened since we last said good form?
      const mistakeHappenedSinceLast = mistakeHappenedSinceLastGoodFormRef.current

      // Very first good form detection this session
      const isFirstEver = goodFormSpokenCountRef.current === 0

      // Long cooldown passed (consistent good form for 30+ seconds)
      const longCooldownPassed = (now - lastGoodFormSpokenTimeRef.current) > GOOD_FORM_LONG_COOLDOWN_MS

      // ───────────────────────────────────────────────────────────────────
      // DECISION: Should we speak good form?
      // This fixes Problem 2 - good form only speaks when meaningful
      // ───────────────────────────────────────────────────────────────────
      const shouldSpeak = 
        isFirstEver ||                                    // First detection ever
        (recentMistake && mistakeHappenedSinceLast) ||   // Just corrected a mistake
        (longCooldownPassed && !isSpeaking)              // Long time, reward user

      if (!shouldSpeak) {
        return // Don't speak - would be repetitive
      }

      // Speak good form
      speakUtterance(text, 'good_form')

      // Update tracking
      goodFormSpokenCountRef.current += 1
      lastGoodFormSpokenTimeRef.current = now
      mistakeHappenedSinceLastGoodFormRef.current = false
      return
    }
  }, [isSupported, enabled, speakUtterance])

  /**
   * Cancel any ongoing speech
   */
  const cancel = useCallback(() => {
    if (!isSupported) return
    
    try {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      currentlyPlayingTypeRef.current = 'none'
      currentUtteranceRef.current = null
    } catch (err) {
      console.warn('Failed to cancel speech:', err)
    }
  }, [isSupported])

  /**
   * Reset all voice state (call when session ends)
   */
  const reset = useCallback(() => {
    // Cancel any ongoing speech
    cancel()

    // Reset all refs to initial values
    currentlyPlayingTypeRef.current = 'none'
    currentUtteranceRef.current = null
    lastSpokenTextRef.current = ''
    lastSpokenTimeRef.current = 0
    lastMistakeTimeRef.current = 0
    lastGoodFormSpokenTimeRef.current = 0
    mistakeHappenedSinceLastGoodFormRef.current = false
    goodFormSpokenCountRef.current = 0
  }, [cancel])

  /**
   * Set a specific voice
   */
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice)
  }, [])

  /**
   * Load available voices (voices load asynchronously in browsers)
   */
  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)

      // Auto-select a good default voice for the current language
      const preferredLang = language === 'ar' ? 'ar' : 'en'
      const preferred = voices.find(v =>
        v.lang.startsWith(preferredLang) &&
        (v.name.includes('Google') || v.name.includes('Microsoft'))
      ) || voices.find(v => v.lang.startsWith(preferredLang))

      if (preferred && !selectedVoice) {
        setSelectedVoice(preferred)
      }
    }

    // Load voices immediately
    loadVoices()

    // Voices may load asynchronously, so listen for the event
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [language, isSupported, selectedVoice])

  /**
   * Cleanup on unmount - cancel any ongoing speech
   */
  useEffect(() => {
    return () => {
      if (isSupported) {
        try {
          window.speechSynthesis.cancel()
        } catch (err) {
          // Ignore errors during cleanup
        }
      }
    }
  }, [isSupported])

  return {
    speak,
    cancel,
    reset,        // NEW: Expose reset function
    isSupported,
    isSpeaking,
    availableVoices,
    selectedVoice,
    setVoice
  }
}
