import { createContext, useContext, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [loading] = useState(false)

  const login = async (loginValue, senha) => {
    try {
      const authResponse = await authService.authenticate(loginValue, senha)
      const jwt = authResponse?.JWT
      const apiUser = authResponse?.User

      if (!jwt || !apiUser?.IdUsuario) {
        return { success: false, message: 'Resposta de autenticacao invalida.' }
      }

      const verifyResponse = await authService.verifyAccess(apiUser.IdUsuario, jwt)

      const userData = {
        ...apiUser,
        roleId: verifyResponse.Perfis[0]
      }

      localStorage.setItem('token', jwt)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

      return { success: true, user: userData }
    } catch (error) {
      const status = error?.response?.status

      if (status === 401 || status === 403) {
        return { success: false, message: 'Usuario sem acesso ao sistema.' }
      }

      return {
        success: false,
        message: error?.response?.data?.message || 'Erro ao autenticar. Verifique login e senha.'
      }
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

