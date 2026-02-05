import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Timeline from './pages/Timeline'
import MarcoForm from './pages/MarcoForm'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Confirm from './components/Confirm/Confirm'
import Alert from './components/Alert/Alert'
import { MarcosProvider } from './context/MarcosContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import './App.css'

// Variável global para acessar o confirm e alert
export let showConfirm
export let showAlert

function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAprovador = user?.roleId === 'Aprovador'
  const isContribuidor = user?.roleId === 'Contribuidor'

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Observatório TI</h1>
          <nav>
            <Link to="/">Timeline</Link>
            {user && (
              <>
                {isContribuidor && (
                  <Link to="/novo-marco">Nova Entrega</Link>
                )}
                {isAprovador && (
                  <Link to="/admin">Administração</Link>
                )}
              </>
            )}
          </nav>
          {user && (
            <div className="user-menu">
              <span className="user-name">{user.name || user.email}</span>
              <span className="user-role">{isAprovador ? 'Aprovador' : 'Contribuidor'}</span>
              <button onClick={handleLogout} className="btn-logout">Sair</button>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Timeline />} />
          <Route path="/novo-marco" element={<PrivateRoute><MarcoForm /></PrivateRoute>} />
          <Route path="/editar-marco/:id" element={<PrivateRoute><MarcoForm /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  const [confirmRef, setConfirmRef] = useState(null)

  const refShowConfirm = (show) => {
    showConfirm = show
  }

  const refShowAlert = (show) => {
    showAlert = show
  }

  return (
    <AuthProvider>
      <MarcosProvider>
        <Confirm refShow={refShowConfirm} />
        <Alert refShow={refShowAlert} />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </Router>
      </MarcosProvider>
    </AuthProvider>
  )
}

export default App
