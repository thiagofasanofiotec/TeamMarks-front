import axios from 'axios'

const SEG_API_BASE = 'https://api.fiotec.org.br/SegAPI'

export const authService = {
  authenticate: async (login, senha) => {
    const response = await axios.post(
      `${SEG_API_BASE}/login/auth`,
      { login, senha },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  },

  verifyAccess: async (idUsuario, jwt) => {
    const response = await axios.post(
      `${SEG_API_BASE}/access/verify`,
      {
        IdUsuario: idUsuario,
        IdSistema: 42
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`
        }
      }
    )

    return response.data
  },

  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('user')
  }
}
