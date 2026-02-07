import { useState, useEffect, useRef } from 'react'
import { useMarcosContext } from '../context/MarcosContext'
import './TimelineTV.css'

function TimelineTV() {
  const { marcos } = useMarcosContext()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  // Filtra apenas marcos aprovados
  const marcosAprovados = marcos
    .filter(m => m.statusId === 2)
    .sort((a, b) => new Date(b.data) - new Date(a.data)) // Mais recente primeiro
  
  // Calcula quantos slides temos (3 entregas por slide)
  const totalSlides = Math.ceil(marcosAprovados.length / 3)

  const formatarData = (dataString) => {
    if (!dataString) return ''
    const [ano, mes, dia] = dataString.split('-')
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${dia} ${meses[parseInt(mes) - 1]} ${ano}`
  }

  const limparHTML = (html) => {
    if (!html) return ''
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  const truncarTexto = (texto, limite = 150) => {
    if (!texto) return ''
    const textoLimpo = limparHTML(texto)
    if (textoLimpo.length <= limite) return textoLimpo
    return textoLimpo.substring(0, limite) + '...'
  }

  useEffect(() => {
    if (totalSlides > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides)
      }, 10000) // 10 segundos

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [totalSlides])

  // Pega as 3 entregas do slide atual
  const startIndex = currentSlide * 3
  const currentMarcos = marcosAprovados.slice(startIndex, startIndex + 3)

  const getTypeIcon = (typeId) => {
    return typeId === 1 ? '🖥️' : typeId === 2 ? '⚙️' : '🔒'
  }

  const getTypeLabel = (typeId) => {
    return typeId === 1 ? 'Sistemas' : typeId === 2 ? 'Infra' : 'DevSecops'
  }

  const getTypeColor = (typeId) => {
    return typeId === 1 ? '#2563eb' : typeId === 2 ? '#059669' : '#dc2626'
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Erro ao alternar fullscreen:', err)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className="timeline-tv" ref={containerRef}>
      <div className="tv-header">
        <h1>📊 Timeline de Entregas TI</h1>
        
        <div className="tv-controls">
          <div className="tv-stats-container">
            <div className="tv-stat-card">
              <div className="tv-stat-icon">🎯</div>
              <div className="tv-stat-value">{marcosAprovados.length}</div>
              <div className="tv-stat-label">Total de Entregas</div>
            </div>
          </div>
          <div className="tv-info-text">Dados a partir de Maio de 2025</div>
        </div>
        
        <button 
          className="tv-fullscreen-btn" 
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Sair do modo tela cheia' : 'Entrar em modo tela cheia'}
        >
          {isFullscreen ? '🗙' : '⛶'}
        </button>
      </div>

      <div className="tv-content">
        {marcosAprovados.length === 0 ? (
          <div className="tv-empty-state">
            <div className="tv-empty-icon">📅</div>
            <h2>Nenhuma entrega encontrada</h2>
            <p>Não há entregas aprovadas para exibir.</p>
          </div>
        ) : (
          <>
            <div className="tv-cards">
          {currentMarcos.map((marco, index) => (
            <div 
              key={marco.id} 
              className={`tv-card ${marco.highlighted ? 'tv-card-highlighted' : ''}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {marco.highlighted && (
                <div className="tv-star">⭐</div>
              )}
              
              <div className="tv-card-header">
                <div 
                  className="tv-type-badge" 
                  style={{ backgroundColor: getTypeColor(marco.typeId) }}
                >
                  {getTypeIcon(marco.typeId)} {getTypeLabel(marco.typeId)}
                </div>
                <div className="tv-date">{formatarData(marco.data)}</div>
              </div>

              <h2 className="tv-title">{marco.titulo}</h2>
              
              <p className="tv-description">{truncarTexto(marco.highlights || marco.descricao, 200)}</p>

              {marco.squads && (
                <div className="tv-squads">
                  <span className="tv-squads-label">👥 Squad:</span>
                  <span className="tv-squads-value">{marco.squads}</span>
                </div>
              )}
            </div>
          ))}
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TimelineTV
