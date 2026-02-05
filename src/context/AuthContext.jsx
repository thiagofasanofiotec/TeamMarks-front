import { createContext, useContext, useState, useEffect } from 'react'
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
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = async (email, codeHash) => {
    try {
      const response = await authService.validateCode(email, codeHash)
      console.log('Resposta da validação:', response) // Debug
      
      // Busca os dados do usuário salvos temporariamente ao enviar o código
      const tempUserStr = localStorage.getItem('tempUser')
      let userData = null
      
      if (tempUserStr) {
        userData = JSON.parse(tempUserStr)
        localStorage.removeItem('tempUser') // Remove dados temporários
      } else if (response?.user) {
        userData = response.user
      } else if (response?.id || response?.email) {
        userData = response
      } else {
        // Fallback: cria usuário básico
        userData = { 
          email, 
          name: email.split('@')[0],
          roleId: 'Contribuidor'
        }
      }
      
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      console.log('Usuário logado:', userData) // Debug
      
      return { success: true }
    } catch (error) {
      console.error('Erro no login:', error) // Debug
      localStorage.removeItem('tempUser') // Limpa dados temporários em caso de erro
      return { success: false, message: error.response?.data?.message || 'Erro ao fazer login' }
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const sendCode = async (email) => {
    try {
      const response = await authService.sendCode(email)
      console.log('Resposta do envio de código:', response) // Debug
      
      // A API retorna os dados do usuário ao enviar o código
      if (response?.id || response?.email) {
        // Salva temporariamente os dados do usuário para usar após validação
        localStorage.setItem('tempUser', JSON.stringify(response))
      }
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar código:', error) // Debug
      return { success: false, message: error.response?.data?.message || 'Erro ao enviar código' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      sendCode,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}
