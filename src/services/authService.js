import api from './api'

export const authService = {
  sendCode: async (email) => {
    const response = await api.post('/Login/email', {email: email}, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  validateCode: async (email, codeHash) => {
    const response = await api.post('/Login/validate', {
      email,
      codeHash
    })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('user')
  }
}
