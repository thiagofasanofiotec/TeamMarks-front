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
    return `${dia} ${meses[parseInt(mes, 10) - 1]} ${ano}`
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
    return `${textoLimpo.substring(0, limite)}...`
  }

  const getHighlightItems = (highlights) => {
    if (!highlights) return []

    const itemsFromHtmlList = [...highlights.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((match) => limparHTML(match[1]))
      .filter(Boolean)

    if (itemsFromHtmlList.length > 0) return itemsFromHtmlList

    const normalized = limparHTML(highlights)
    const itemsFromText = normalized
      .split(/\r?\n+|\s+[•??]\s+|\s-\s/g)
      .map((item) => item.trim())
      .filter(Boolean)

    if (itemsFromText.length > 0) return itemsFromText

    return normalized ? [normalized] : []
  }

  useEffect(() => {
    if (currentSlide >= totalSlides && totalSlides > 0) {
      setCurrentSlide(0)
    }
  }, [currentSlide, totalSlides])

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

  const total = marcosAprovados.length
  const sistemas = marcosAprovados.filter((m) => m.typeId === 1).length
  const infra = marcosAprovados.filter((m) => m.typeId === 2).length
  const devsecops = marcosAprovados.filter((m) => m.typeId === 3).length
  const mediaMensal = total > 0 ? Math.round(total / 12) : 0

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
    <div className={`timeline-tv ${isFullscreen ? 'tv-is-fullscreen' : ''}`} ref={containerRef}>
      <div className="tv-header">
        <div className="tv-header-top">
          <h1>Timeline TV</h1>
          <button
            className="tv-fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair do modo tela cheia' : 'Entrar em modo tela cheia'}
          >
            {isFullscreen ? '\uD83D\uDDD7' : '\u26F6'}
          </button>
        </div>

        <div className="tv-inline-stats tv-estatisticas-grid">
          <div className="tv-numero-card">
            <div className="tv-numero-valor">{total}</div>
            <div className="tv-numero-label">Total de Entregas</div>
          </div>
          <div className="tv-numero-card sistemas">
            <div className="tv-numero-valor">{sistemas}</div>
            <div className="tv-numero-label">Sistemas</div>
            <div className="tv-numero-percent">{total ? ((sistemas / total) * 100).toFixed(0) : 0}%</div>
          </div>
          <div className="tv-numero-card infra">
            <div className="tv-numero-valor">{infra}</div>
            <div className="tv-numero-label">Infra</div>
            <div className="tv-numero-percent">{total ? ((infra / total) * 100).toFixed(0) : 0}%</div>
          </div>
          <div className="tv-numero-card devsecops">
            <div className="tv-numero-valor">{devsecops}</div>
            <div className="tv-numero-label">DevSecops</div>
            <div className="tv-numero-percent">{total ? ((devsecops / total) * 100).toFixed(0) : 0}%</div>
          </div>
          <div className="tv-numero-card">
            <div className="tv-numero-valor">{mediaMensal}</div>
            <div className="tv-numero-label">Media Mensal</div>
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

                {isFullscreen && marco.highlights && (
                  <div className="tv-highlights">
                    <span className="tv-highlights-label">Destaques:</span>
                    <ul className="tv-highlights-list">
                      {getHighlightItems(marco.highlights)
                        .slice(0, 4)
                        .map((item, itemIndex) => (
                          <li key={`${marco.id}-highlight-${itemIndex}`} className="tv-highlights-item">
                            {truncarTexto(item, 120)}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {marco.squads && (
                  <div className="tv-squads">
                    <span className="tv-squads-label">{'\uD83D\uDC65'} Squad:</span>
                    <span className="tv-squads-value">{marco.squads}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TimelineTV


