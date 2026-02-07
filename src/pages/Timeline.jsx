import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { useMarcosContext } from '../context/MarcosContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showConfirm } from '../App'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import './Timeline.css'

function Timeline() {
  const { marcos, excluirMarco, loading, error } = useMarcosContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalAberto, setModalAberto] = useState(false)
  const [marcoSelecionado, setMarcoSelecionado] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState(null) // null = todos, 1 = sistemas, 2 = infra, 3 = devsecops
  const [anoTimeline, setAnoTimeline] = useState(null) // null = não inicializado
  // Removidos estados de estatísticas e insights TI.A
  const [isScrolled, setIsScrolled] = useState(false)

  
  // Refs para controlar animações
  const timelineItemsRef = useRef([])
  const mesRefs = useRef({})

  // Filtra apenas entregas aprovadas (status 2)
  const marcosAprovados = marcos.filter(m => m.statusId === 2)
  
  // Extrai anos únicos disponíveis
  const anosDisponiveis = [...new Set(
    marcosAprovados
      .filter(m => m.data)
      .map(m => m.data.split('-')[0])
  )].sort((a, b) => b - a) // Ordem decrescente (mais recente primeiro)
  
  useEffect(() => {
    if (anosDisponiveis.length > 0 && anoTimeline === null) {
      setAnoTimeline(anosDisponiveis[0])
    }
  }, [anosDisponiveis.length, anoTimeline])
  
  // Filtro de ano
  const marcosFiltradosPorAno = anoTimeline
    ? marcosAprovados.filter(m => m.data && m.data.startsWith(anoTimeline))
    : marcosAprovados
  
  // Aplica filtro de tipo se selecionado
  const marcosFiltrados = filtroTipo 
    ? marcosFiltradosPorAno.filter(m => m.typeId === filtroTipo)
    : marcosFiltradosPorAno
  
  // Ordena as entregas por data (mais recentes primeiro)
  const marcosSorted = [...marcosFiltrados].sort((a, b) => new Date(b.data) - new Date(a.data))

  // Extrai meses únicos para navegação
  const mesesDisponiveis = [...new Set(
    marcosSorted.map(m => {
      if (!m.data) return null
      return new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }).filter(Boolean)
  )]

  // Função para scroll suave até o mês
  const scrollToMes = (mes) => {
    const mesRef = mesRefs.current[mes]
    if (mesRef) {
      const headerOffset = 100
      const elementPosition = mesRef.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Detecta scroll para mostrar navegação de meses
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer para animação de fade
  useEffect(() => {
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

    // Observa todos os itens da timeline
    timelineItemsRef.current.forEach((item) => {
      if (item) observer.observe(item)
    })

    return () => {
      timelineItemsRef.current.forEach((item) => {
        if (item) observer.unobserve(item)
      })
    }
  }, [marcosSorted])

  const toggleFiltro = (tipo) => {
    setFiltroTipo(tipo)
  }

  const formatarData = (data) => {
    const date = new Date(data + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const truncarTexto = (texto, limite = 50) => {
    if (texto.length <= limite) return texto
    return texto.substring(0, limite) + '...'
  }

  const truncarDescricao = (texto, limite = 200) => {
    if (!texto) return ''
    // Remove tags HTML
    const textoLimpo = limparHTML(texto)
    if (textoLimpo.length <= limite) return textoLimpo
    return textoLimpo.substring(0, limite) + '...'
  }

  const limparHTML = (html) => {
    if (!html) return ''
    return html
      .replace(/<[^>]*>/g, '') // Remove todas as tags HTML
      .replace(/&nbsp;/g, ' ') // Substitui &nbsp; por espaço
      .replace(/&amp;/g, '&') // Substitui &amp; por &
      .replace(/&lt;/g, '<') // Substitui &lt; por <
      .replace(/&gt;/g, '>') // Substitui &gt; por >
      .replace(/&quot;/g, '"') // Substitui &quot; por "
      .trim()
  }

  const abrirModal = (marco) => {
    setMarcoSelecionado(marco)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setMarcoSelecionado(null)
  }

  const handleEditar = (id) => {
    fecharModal()
    navigate(`/editar-marco/${id}`)
  }

  const handleExcluir = async (id) => {
    if (!showConfirm) {
      console.error('showConfirm não está disponível')
      alert('Erro ao carregar componente de confirmação. Recarregue a página.')
      return
    }

    const confirmed = await showConfirm({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir esta entrega? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    })

    if (confirmed) {
      excluirMarco(id)
      fecharModal()
    }
  }


  return (
    <div className="resumo-ia-container">
      <h2>Timeline Web</h2>

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
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>
                  📅 {ano} ({marcosAprovados.filter(m => m.data && m.data.startsWith(ano)).length})
                </option>
              ))}
            </select>
          </div>
          <div className="filter-select-container">
            <select 
              id="filtro-tipo"
              value={filtroTipo === null ? 'todos' : filtroTipo}
              onChange={(e) => toggleFiltro(e.target.value === 'todos' ? null : parseInt(e.target.value))}
              className="tipo-filter-select"
            >
              <option value="todos">📋 Todas as áreas ({marcosFiltradosPorAno.length})</option>
              <option value="1">🖥️ Sistemas ({marcosFiltradosPorAno.filter(m => m.typeId === 1).length})</option>
              <option value="2">⚙️ Infra ({marcosFiltradosPorAno.filter(m => m.typeId === 2).length})</option>
              <option value="3">🔒 DevSecops ({marcosFiltradosPorAno.filter(m => m.typeId === 3).length})</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading && <div className="loading-state">Carregando entregas...</div>}
      {error && <div className="error-state">{error}</div>}
      
      {!loading && marcosSorted.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma entrega aprovada ainda.</p>
          {user?.roleId === 'Contribuidor' && (
            <button onClick={() => navigate('/novo-marco')} className="btn-primary">
              Criar Primeira Entrega
            </button>
          )}
        </div>
      ) : (
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
                // Verifica se é a primeira entrega do mês
                const mesAtual = new Date(marco.data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                const mesAnterior = index > 0 
                  ? new Date(marcosSorted[index - 1].data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                  : null
                const isPrimeiroDoMes = mesAtual !== mesAnterior
                return (
                  <React.Fragment key={marco.id}>
                    {isPrimeiroDoMes && (
                      <div 
                        className="timeline-mes-divider"
                        ref={(el) => (mesRefs.current[mesAtual] = el)}
                      >
                        <span className="timeline-mes-label">📅 {mesAtual}</span>
                      </div>
                    )}
                    <div 
                      ref={(el) => (timelineItemsRef.current[index] = el)}
                      className={`timeline-item-vertical fade-in-item ${index % 2 === 0 ? 'timeline-item-right' : 'timeline-item-left'}`}
                      onClick={() => abrirModal(marco)}
                    >
                      <div 
                        className="timeline-dot" 
                        style={{ borderColor: '#2563eb' }}
                      ></div>
                      <div className="timeline-date-badge">{formatarData(marco.data)}</div>
                      <div 
                        className={`timeline-card-vertical ${marco.highlighted ? 'highlighted' : ''}`}
                        style={{ 
                          borderLeftColor: marco.highlighted ? '#fbbf24' : (index % 2 === 0 ? marco.cor : '#e8edf2'),
                          borderRightColor: marco.highlighted ? '#fbbf24' : (index % 2 === 0 ? '#e8edf2' : marco.cor)
                        }}
                      >
                        <div className="timeline-icon-large" style={{ 
                          backgroundColor: '#2563eb'
                        }}>
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
      )}

      {modalAberto && marcoSelecionado && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModal}>×</button>
            <div className="modal-header" style={{ 
              borderTopColor: '#2563eb'
            }}>
              <h2>{marcoSelecionado.titulo}</h2>
              <div className="modal-meta">
                <span className="modal-type-badge" style={{ 
                  backgroundColor: '#2563eb'
                }}>
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
                    <span style={{
                        background: '#f3f4f6',
                        color: '#000',
                        fontSize: '0.82em',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        marginTop: '8px',
                        display: 'inline-block',
                        fontWeight: 500
                      }}>
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