import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginValue, setLoginValue] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!loginValue || !senha) {
      setError('Informe login e senha.')
      return
    }

    setLoading(true)
    const result = await login(loginValue, senha)
    setLoading(false)

    if (result.success) {
      navigate('/')
      return
    }

    setError(result.message)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Observatorio TI</h1>
          <p>Gerenciador de Entregas da Equipe</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Entrar</h2>
          <p className="login-subtitle">Informe seu login e senha para continuar</p>

          {error && <div className="error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input
              type="text"
              id="login"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              placeholder="Seu login"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <br />

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
