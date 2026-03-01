import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarcosContext } from '../context/MarcosContext'
import { useAuth } from '../context/AuthContext'
import './Timeline.css'

function Timeline() {
  const { marcos, loading, error } = useMarcosContext()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [modalAberto, setModalAberto] = useState(false)
  const [marcoSelecionado, setMarcoSelecionado] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState(null)
  const [anoTimeline, setAnoTimeline] = useState(null)
  const [modoVisualizacao, setModoVisualizacao] = useState('timeline')
  const [isScrolled, setIsScrolled] = useState(false)

  const timelineItemsRef = useRef([])
  const mesRefs = useRef({})

  const marcosAprovados = marcos.filter((m) => m.statusId === 2)

  const anosDisponiveis = [...new Set(
    marcosAprovados
      .filter((m) => m.data)
      .map((m) => m.data.split('-')[0])
  )].sort((a, b) => b - a)

  useEffect(() => {
    if (anosDisponiveis.length > 0 && anoTimeline === null) {
      setAnoTimeline(anosDisponiveis[0])
    }
  }, [anosDisponiveis, anoTimeline])

  const marcosFiltradosPorAno = anoTimeline
    ? marcosAprovados.filter((m) => m.data && m.data.startsWith(anoTimeline))
    : marcosAprovados

  const marcosFiltrados = filtroTipo
    ? marcosFiltradosPorAno.filter((m) => m.typeId === filtroTipo)
    : marcosFiltradosPorAno

  const marcosSorted = [...marcosFiltrados].sort((a, b) => new Date(b.data) - new Date(a.data))

  const mesesDisponiveis = [...new Set(
    marcosSorted
      .map((m) => {
        if (!m.data) return null
        return new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric'
        })
      })
      .filter(Boolean)
  )]

  const entregasAgrupadasPorMes = marcosSorted.reduce((acc, marco) => {
    if (!marco.data) return acc

    const mesAno = new Date(marco.data + 'T00:00:00').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    })

    if (!acc[mesAno]) {
      acc[mesAno] = []
    }

    acc[mesAno].push(marco)
    return acc
  }, {})

  const scrollToMes = (mes) => {
    const mesRef = mesRefs.current[mes]
    if (!mesRef) return

    const headerOffset = 100
    const elementPosition = mesRef.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (modoVisualizacao !== 'timeline') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    timelineItemsRef.current.forEach((item) => {
      if (item) observer.observe(item)
    })

    return () => {
      timelineItemsRef.current.forEach((item) => {
        if (item) observer.unobserve(item)
      })
    }
  }, [marcosSorted, modoVisualizacao])

  const toggleFiltro = (tipo) => setFiltroTipo(tipo)

  const formatarData = (data) => {
    const date = new Date(data + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const obterNomeArea = (typeId) => {
    if (typeId === 1) return 'Sistemas'
    if (typeId === 2) return 'Infra'
    if (typeId === 3) return 'DevSecops'
    return 'Área'
  }

  const truncarTexto = (texto, limite = 50) => {
    if (!texto) return ''
    if (texto.length <= limite) return texto
    return texto.substring(0, limite) + '...'
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

  const truncarDescricao = (texto, limite = 200) => {
    if (!texto) return ''
    const textoLimpo = limparHTML(texto)
    if (textoLimpo.length <= limite) return textoLimpo
    return textoLimpo.substring(0, limite) + '...'
  }

  const abrirModal = (marco) => {
    setMarcoSelecionado(marco)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setMarcoSelecionado(null)
  }

  return (
    <div className="resumo-ia-container">
      <h2>Timeline</h2>

      <br />

      <div className="timeline-info-banner">
        <span className="info-icon">ℹ️</span>
        <span>Dados a partir de Maio de 2025</span>
      </div>

      <br />

      <div className="timeline-filters">
        <div className="filters-left-group">
          <div className="filter-select-container">
            <select
              id="filtro-ano"
              value={anoTimeline || ''}
              onChange={(e) => setAnoTimeline(e.target.value)}
              className="tipo-filter-select"
            >
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>
                  {ano} ({marcosAprovados.filter((m) => m.data && m.data.startsWith(ano)).length})
                </option>
              ))}
            </select>
          </div>
          <div className="filter-select-container">
            <select
              id="filtro-tipo"
              value={filtroTipo === null ? 'todos' : filtroTipo}
              onChange={(e) => toggleFiltro(e.target.value === 'todos' ? null : parseInt(e.target.value, 10))}
              className="tipo-filter-select"
            >
              <option value="todos">Todas as áreas ({marcosFiltradosPorAno.length})</option>
              <option value="1">Sistemas ({marcosFiltradosPorAno.filter((m) => m.typeId === 1).length})</option>
              <option value="2">Infra ({marcosFiltradosPorAno.filter((m) => m.typeId === 2).length})</option>
              <option value="3">DevSecops ({marcosFiltradosPorAno.filter((m) => m.typeId === 3).length})</option>
            </select>
          </div>
        </div>

        <div className="timeline-mode-switch">
          <button
            type="button"
            className={`timeline-mode-btn ${modoVisualizacao === 'timeline' ? 'active' : ''}`}
            onClick={() => setModoVisualizacao('timeline')}
          >
            Padrão
          </button>
          <button
            type="button"
            className={`timeline-mode-btn ${modoVisualizacao === 'tabulada' ? 'active' : ''}`}
            onClick={() => setModoVisualizacao('tabulada')}
          >
            Tabela
          </button>
        </div>
      </div>

      {loading && <div className="loading-state">Carregando entregas...</div>}
      {error && <div className="error-state">{error}</div>}

      {!loading && marcosSorted.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma entrega aprovada ainda.</p>
          {user?.roleId === 'Contribuidor' && (
            <button onClick={() => navigate('/novo-marco')} className="btn-primary">
              Criar primeira entrega
            </button>
          )}
        </div>
      ) : (
        <>
          {modoVisualizacao === 'timeline' ? (
            <>
              {mesesDisponiveis.length > 1 && isScrolled && (
                <div className="month-navigation">
                  <div className="month-navigation-title">Navegar por mês:</div>
                  <div className="month-navigation-buttons">
                    {mesesDisponiveis.map((mes) => (
                      <button
                        key={mes}
                        className="month-nav-btn"
                        onClick={() => scrollToMes(mes)}
                        title={`Ir para ${mes}`}
                      >
                        {mes.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="timeline-vertical-wrapper">
                <div className="timeline-vertical">
                  {marcosSorted.map((marco, index) => {
                    const mesAtual = new Date(marco.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric'
                    })
                    const mesAnterior = index > 0
                      ? new Date(marcosSorted[index - 1].data + 'T00:00:00').toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric'
                      })
                      : null
                    const isPrimeiroDoMes = mesAtual !== mesAnterior

                    return (
                      <React.Fragment key={marco.id}>
                        {isPrimeiroDoMes && (
                          <div className="timeline-mes-divider" ref={(el) => (mesRefs.current[mesAtual] = el)}>
                            <span className="timeline-mes-label">📅 {mesAtual}</span>
                          </div>
                        )}

                        <div
                          ref={(el) => (timelineItemsRef.current[index] = el)}
                          className={`timeline-item-vertical fade-in-item ${index % 2 === 0 ? 'timeline-item-right' : 'timeline-item-left'}`}
                          onClick={() => abrirModal(marco)}
                        >
                          <div className="timeline-dot" style={{ borderColor: '#2563eb' }}></div>
                          <div className="timeline-date-badge">{formatarData(marco.data)}</div>
                          <div
                            className={`timeline-card-vertical ${marco.highlighted ? 'highlighted' : ''}`}
                            style={{
                              borderLeftColor: marco.highlighted ? '#fbbf24' : (index % 2 === 0 ? marco.cor : '#e8edf2'),
                              borderRightColor: marco.highlighted ? '#fbbf24' : (index % 2 === 0 ? '#e8edf2' : marco.cor)
                            }}
                          >
                            <div className="timeline-icon-large" style={{ backgroundColor: '#2563eb' }}>
                              {marco.typeId === 1 ? '🖥️' : marco.typeId === 2 ? '⚙️' : '🔒'}
                            </div>
                            <div className="timeline-content-wrapper">
                              <h3 className="timeline-title-vertical">{truncarTexto(marco.titulo, 60)}</h3>
                              <p className="timeline-description-preview">{truncarDescricao(marco.highlights || marco.descricao, 200)}</p>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="monthly-table-view">
              {Object.entries(entregasAgrupadasPorMes).map(([mesAno, entregas]) => (
                <div key={mesAno} className="monthly-table-card">
                  <div className="monthly-table-header">
                    <h3>{mesAno}</h3>
                    <span>{entregas.length} entrega{entregas.length > 1 ? 's' : ''}</span>
                  </div>

                  <div className="monthly-table-wrapper">
                    <table className="monthly-table">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Entrega</th>
                          <th>Área</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entregas.map((marco) => (
                          <tr
                            key={marco.id}
                            onClick={() => abrirModal(marco)}
                            className={marco.highlighted ? 'monthly-row-highlighted' : ''}
                          >
                            <td className="monthly-date">{formatarData(marco.data)}</td>
                            <td className="monthly-delivery-cell">
                              <div className="monthly-delivery-title">{truncarTexto(marco.titulo, 75)}</div>
                              <div className="monthly-delivery-description">
                                {truncarDescricao(marco.highlights || marco.descricao, 140)}
                              </div>
                            </td>
                            <td>
                              <span className={`monthly-area-badge area-${marco.typeId || 'default'}`}>
                                {obterNomeArea(marco.typeId)}
                              </span>
                              {marco.highlighted && <span className="monthly-highlight-badge">⭐ Destaque</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalAberto && marcoSelecionado && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModal}>×</button>
            <div className="modal-header" style={{ borderTopColor: '#2563eb' }}>
              <h2>{marcoSelecionado.titulo}</h2>
              <div className="modal-meta">
                <span className="modal-type-badge" style={{ backgroundColor: '#2563eb' }}>
                  {marcoSelecionado.typeId === 1 ? '🖥️ Sistemas' : marcoSelecionado.typeId === 2 ? '⚙️ Infra' : '🔒 DevSecops'}
                </span>
                <div className="modal-date">{formatarData(marcoSelecionado.data)}</div>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4 className="modal-section-title">Descrição</h4>
                <p className="modal-description" style={{ whiteSpace: 'pre-wrap' }}>{limparHTML(marcoSelecionado.descricao)}</p>
              </div>

              {marcoSelecionado.highlights && marcoSelecionado.highlights.trim() && (
                <div className="modal-section">
                  <h4 className="modal-section-title">Destaques</h4>
                  <div className="modal-highlights">
                    <p className="highlights-content" style={{ whiteSpace: 'pre-wrap' }}>{limparHTML(marcoSelecionado.highlights)}</p>
                  </div>
                  {marcoSelecionado.descriptionGeneratedIA === true && (
                    <span
                      style={{
                        background: '#f3f4f6',
                        color: '#000',
                        fontSize: '0.82em',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        marginTop: '8px',
                        display: 'inline-block',
                        fontWeight: 500
                      }}
                    >
                      🤖 Os destaques foram gerados por inteligência artificial a partir da descrição.
                    </span>
                  )}
                </div>
              )}

              {(marcoSelecionado.squad || marcoSelecionado.squads) && (marcoSelecionado.squad || marcoSelecionado.squads).trim() && (
                <div className="modal-section">
                  <h4 className="modal-section-title">Squads Participantes</h4>
                  <p className="modal-description">{marcoSelecionado.squad || marcoSelecionado.squads}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Timeline
