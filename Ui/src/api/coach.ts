/**
 * AI Coach API Client
 *
 * Handles chat requests to the FitMe AI Coach fitness chatbot.
 * The backend automatically uses the logged-in user's profile and history,
 * so no personal data needs to be sent from the client.
 */

import apiClient from './client'

export interface ChatResponse {
  reply: string
}

export const coachApi = {
  /**
   * Send a message to the AI Coach and get a personalized fitness reply.
   * Requires authentication (token is added automatically by apiClient).
   */
  sendMessage: async (message: string): Promise<string> => {
    const response = await apiClient.post<ChatResponse>('/coach/chat', { message })
    return response.data.reply
  },

  /**
   * Clear the conversation memory for the current user (start a fresh chat).
   */
  reset: async (): Promise<void> => {
    await apiClient.post('/coach/reset')
  },
}
