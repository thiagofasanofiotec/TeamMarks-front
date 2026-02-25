import { useState, useEffect, useRef } from 'react'
import { useMarcosContext } from '../context/MarcosContext'
import './TimelineTV.css'

function TimelineTV() {
  const { marcos } = useMarcosContext()
  const ITEMS_PER_SLIDE = 3
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  const marcosAprovados = marcos
    .filter((m) => m.statusId === 2)
    .sort((a, b) => new Date(b.data) - new Date(a.data))

  const totalSlides = Math.ceil(marcosAprovados.length / ITEMS_PER_SLIDE)

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
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
      }, 15000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [totalSlides])

  const startIndex = currentSlide * ITEMS_PER_SLIDE
  const currentMarcos = marcosAprovados.slice(startIndex, startIndex + ITEMS_PER_SLIDE)

  const getTypeIcon = (typeId) => {
    if (typeId === 1) return '\uD83D\uDDA5\uFE0F'
    if (typeId === 2) return '\uD83D\uDEE0\uFE0F'
    return '\uD83D\uDD12'
  }

  const getTypeLabel = (typeId) => {
    if (typeId === 1) return 'Sistemas'
    if (typeId === 2) return 'Infra'
    return 'DevSecops'
  }

  const getTypeColor = (typeId) => {
    if (typeId === 1) return '#2563eb'
    if (typeId === 2) return '#059669'
    return '#dc2626'
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
        <div className="tv-header-top">
          <h1>Timeline de Entregas TI</h1>
          <button
            className="tv-fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair do modo tela cheia' : 'Entrar em modo tela cheia'}
          >
            {isFullscreen ? '\uD83D\uDDD7' : '\u26F6'}
          </button>
        </div>

        <div className="tv-stats-row">
          <div className="tv-stat-card">
            <div className="tv-stat-icon">{'\uD83D\uDE80'}</div>
            <div className="tv-stat-value">{marcosAprovados.length}</div>
            <div className="tv-stat-label">Total de Entregas</div>
          </div>
        </div>
      </div>

      <div className="tv-content">
        {marcosAprovados.length === 0 ? (
          <div className="tv-empty-state">
            <div className="tv-empty-icon">{'\uD83D\uDCC5'}</div>
            <h2>Nenhuma entrega encontrada</h2>
            <p>Nao ha entregas aprovadas para exibir.</p>
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
                  {marco.highlighted && <div className="tv-star">{'\u2B50'}</div>}

                  <div className="tv-card-header">
                    <div className="tv-type-badge" style={{ backgroundColor: getTypeColor(marco.typeId) }}>
                      {getTypeIcon(marco.typeId)} {getTypeLabel(marco.typeId)}
                    </div>
                    <div className="tv-date">{formatarData(marco.data)}</div>
                  </div>

                  <h2 className="tv-title">{marco.titulo}</h2>

                  <p className="tv-description">{truncarTexto(marco.highlights || marco.descricao, 200)}</p>

                  {marco.squads && (
                    <div className="tv-squads">
                      <span className="tv-squads-label">{'\uD83D\uDC65'} Squad:</span>
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
