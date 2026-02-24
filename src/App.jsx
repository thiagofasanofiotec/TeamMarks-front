import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Timeline from './pages/Timeline'
import TimelineTV from './pages/TimelineTV'
import MarcoForm from './pages/MarcoForm'
import Login from './pages/Login'
import Admin from './pages/Admin'
import Estatisticas from './pages/Estatisticas'
import InsightsTIA from './pages/InsightsTIA'
import Confirm from './components/Confirm/Confirm'
import Alert from './components/Alert/Alert'
import { MarcosProvider } from './context/MarcosContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import './App.css'

// VariÃ¡vel global para acessar o confirm e alert
export let showConfirm
export let showAlert

function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isTimelineView, setIsTimelineView] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300)
    }
    
    const handleTimelineViewChange = (event) => {
      setIsTimelineView(event.detail.view === 'timeline')
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('timelineViewChange', handleTimelineViewChange)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('timelineViewChange', handleTimelineViewChange)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAprovador = user?.roleId === 'Aprovador'
  const isContribuidor = user?.roleId === 'Contribuidor'
  const isRootRoute = location.pathname === '/'

  return (
    <div className="app">
      <header className={`app-header ${isScrolled && isTimelineView && isRootRoute ? 'scrolled' : ''}`}>
        <div className="header-content">
          <h1>Observatório TI</h1>
          <nav>
            <div className="nav-left">
              <Link to="/">Timeline Web</Link>
              <Link to="/timeline-tv">Timeline TV</Link>
              <Link to="/estatisticas">Estatísticas</Link>
              <Link to="/insights-tia">Insights TI.A</Link>
              <Link to="/admin">Administração</Link>
            </div>
            <div className="nav-right">
              <Link
                to="/novo-marco"
                className="btn-nova-entrega"
                style={{
                  background: '#15803d', // Verde 50% mais escuro
                  color: '#fff',
                  border: '1px solid #15803d',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  padding: '0.5rem 1.25rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(21,128,61,0.08)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  marginLeft: 'auto',
                  display: 'inline-block'
                }}
              >
                Nova Entrega
              </Link>
            </div>
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
          <Route path="/timeline-tv" element={<TimelineTV />} />
          <Route path="/novo-marco" element={<MarcoForm />} />
          <Route path="/editar-marco/:id" element={<MarcoForm />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
           <Route path="/insights-tia" element={<InsightsTIA />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  const refShowConfirm = (show) => {
    if (show) {
      showConfirm = show
    }
  }

  const refShowAlert = (show) => {
    if (show) {
      showAlert = show
    }
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


