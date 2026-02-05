import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { sendCode, login } = useAuth()
  const [step, setStep] = useState(1) // 1: email, 2: código
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !email.includes('@')) {
      setError('Digite um email válido')
      return
    }

    setLoading(true)
    const result = await sendCode(email)
    setLoading(false)

    // Permite avançar para a próxima etapa mesmo com erro de domínio não verificado
    const isDomainError = result.message?.includes('domain is not verified') || 
                          result.message?.includes('domínio não verificado')
    
    if (result.success || isDomainError) {
      setStep(2)
      if (isDomainError) {
        setError('⚠️ Aviso: Email pode não ter sido enviado (domínio não verificado). Continue para testar o código.')
      }
    } else {
      setError(result.message)
    }
  }

  const handleValidateCode = async (e) => {
    e.preventDefault()
    setError('')

    if (!code) {
      setError('Digite o código recebido')
      return
    }

    setLoading(true)
    const result = await login(email, code)
    setLoading(false)

    if (result.success) {
      // Busca o usuário logado para verificar o roleId
      const loggedUser = JSON.parse(localStorage.getItem('user'))
      
      // Redireciona baseado no roleId
      if (loggedUser?.roleId === 'Aprovador') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Observatório TI</h1>
          <p>Gerenciador de Entregas da Equipe</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="login-form">
            <h2>Entrar</h2>
            <p className="login-subtitle">Digite seu email para receber o código de acesso</p>
            
            {error && <div className="error-alert">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleValidateCode} className="login-form">
            <h2>Validar Código</h2>
            <p className="login-subtitle">Digite o código enviado para {email}</p>
            
            {error && <div className="error-alert">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="code">Código</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o código"
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Validando...' : 'Entrar'}
            </button>

            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="btn-back"
              disabled={loading}
            >
              Voltar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
