import { mockUserData } from './mockData'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const authAPI = {
  login: async (email: string, _password: string, _rememberMe?: boolean) => {
    await delay(1000)
    return {
      success: true,
      data: {
        token: 'mock-jwt-token',
        userId: mockUserData.id,
        name: mockUserData.name,
        email: email || mockUserData.email,
      },
    }
  },

  register: async (name: string, email: string, _password: string, _confirmPassword: string) => {
    await delay(1000)
    return {
      success: true,
      data: {
        token: 'mock-jwt-token',
        userId: '2',
        name,
        email,
      },
    }
  },

  logout: async () => {
    await delay(500)
    return { success: true }
  },
}
