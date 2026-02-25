import { useState, useEffect } from 'react'
import { useMarcosContext } from '../context/MarcosContext'
import { useNavigate } from 'react-router-dom'
import { showConfirm, showAlert } from '../App'
import api from '../services/api'
import './Admin.css'

function Admin() {
  const { marcos, loading, error, excluirMarco, carregarMarcos } = useMarcosContext()
  const navigate = useNavigate()
  const [filtroStatus, setFiltroStatus] = useState('1')
  const [processando, setProcessando] = useState(null)
  const [buscaTitulo, setBuscaTitulo] = useState('')
  const [filtroAno, setFiltroAno] = useState('')
  const [filtroMes, setFiltroMes] = useState('')

  useEffect(() => {
    carregarMarcos()
  }, [])

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

  const getStatusLabel = (statusId) => {
    const labels = {
      1: 'Pendente',
      2: 'Aprovado',
      3: 'Rejeitado'
    }
    return labels[statusId] || 'Desconhecido'
  }

  const getTypeLabel = (typeId) => {
    const labels = {
      1: 'Sistemas',
      2: 'Infra',
      3: 'DevSecops'
    }
    return labels[typeId] || 'Desconhecido'
  }

  const getTypeIcon = (typeId) => {
    const icons = {
      1: '🖥️',
      2: '🛠️',
      3: '🔒'
    }
    return icons[typeId] || '📌'
  }

  const getStatusClass = (statusId) => {
    const classes = {
      1: 'status-pendente',
      2: 'status-aprovado',
      3: 'status-rejeitado'
    }
    return classes[statusId] || ''
  }

  const handleAprovar = async (marco) => {
    setProcessando(marco.id)
    try {
      await api.put(`/Goal/${marco.id}/approve`)
      await carregarMarcos()
      if (showAlert) {
        showAlert(`Marco "${marco.titulo}" aprovado com sucesso!`, 'success')
      }
    } catch (err) {
      console.error('Erro ao aprovar:', err)
      if (showAlert) {
        showAlert('Erro ao aprovar o marco. Tente novamente.', 'error')
      }
    } finally {
      setProcessando(null)
    }
  }

  const handleRejeitar = async (marco) => {
    if (!showConfirm) {
      console.error('showConfirm não está disponível')
      alert('Erro ao carregar componente de confirmação. Recarregue a página.')
      return
    }

    const confirmed = await showConfirm({
      title: 'Confirmar Rejeição',
      message: `Tem certeza que deseja rejeitar o marco "${marco.titulo}"?`,
      confirmText: 'Sim, rejeitar',
      cancelText: 'Cancelar',
      type: 'danger'
    })

    if (!confirmed) {
      return
    }

    setProcessando(marco.id)
    try {
      await api.put(`/Goal/${marco.id}/reject`)
      await carregarMarcos()
      if (showAlert) {
        showAlert(`Marco "${marco.titulo}" rejeitado.`, 'info')
      }
    } catch (err) {
      console.error('Erro ao rejeitar:', err)
      if (showAlert) {
        showAlert('Erro ao rejeitar o marco. Tente novamente.', 'error')
      }
    } finally {
      setProcessando(null)
    }
  }

  const handleEditar = (id) => {
    navigate(`/editar-marco/${id}`)
  }

  const handleExcluir = async (marco) => {
    if (!showConfirm) {
      console.error('showConfirm não está disponível')
      alert('Erro ao carregar componente de confirmação. Recarregue a página.')
      return
    }

    const confirmed = await showConfirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o marco "${marco.titulo}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    })

    if (confirmed) {
      setProcessando(marco.id)
      try {
        await excluirMarco(marco.id)
        await carregarMarcos()
        if (showAlert) {
          showAlert(`Marco "${marco.titulo}" excluído com sucesso!`, 'success')
        }
      } catch (err) {
        console.error('Erro ao excluir:', err)
        showAlert('Erro ao excluir o marco. Tente novamente.', 'error')
      } finally {
        setProcessando(null)
      }
    }
  }

  const formatarData = (data) => {
    const date = new Date(data + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const anosDisponiveis = [...new Set(
    marcos
      .filter((m) => m.data)
      .map((m) => m.data.split('-')[0])
  )].sort((a, b) => b - a)

  const marcosFiltrados = marcos.filter((m) => {
    if (filtroStatus !== 'todos' && m.statusId !== parseInt(filtroStatus)) {
      return false
    }

    if (buscaTitulo) {
      if (!m.titulo) return false
      const tituloNormalizado = m.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const buscaNormalizada = buscaTitulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (!tituloNormalizado.includes(buscaNormalizada)) {
        return false
      }
    }

    if (filtroAno && m.data && !m.data.startsWith(filtroAno)) {
      return false
    }

    if (filtroMes && m.data) {
      const mesMarco = m.data.split('-')[1]
      if (mesMarco !== filtroMes) {
        return false
      }
    }

    return true
  })

  const contadores = {
    pendentes: marcos.filter((m) => m.statusId === 1).length,
    aprovados: marcos.filter((m) => m.statusId === 2).length,
    rejeitados: marcos.filter((m) => m.statusId === 3).length
  }

  return (
    <div className="admin-container">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Administração de Entregas</h2>
        </div>
        <button className="btn-novo-marco" onClick={() => navigate('/novo-marco')}>
          Nova Entrega
        </button>
      </div>

      <div className="admin-stats">
        <div className={`stat-card pendente ${filtroStatus === '1' ? 'active' : ''}`} onClick={() => setFiltroStatus('1')}>
          <span className="stat-number">{contadores.pendentes}</span>
          <span className="stat-label">Pendentes</span>
        </div>
        <div className={`stat-card aprovado ${filtroStatus === '2' ? 'active' : ''}`} onClick={() => setFiltroStatus('2')}>
          <span className="stat-number">{contadores.aprovados}</span>
          <span className="stat-label">Aprovados</span>
        </div>
        <div className={`stat-card rejeitado ${filtroStatus === '3' ? 'active' : ''}`} onClick={() => setFiltroStatus('3')}>
          <span className="stat-number">{contadores.rejeitados}</span>
          <span className="stat-label">Rejeitados</span>
        </div>
      </div>

      <div className="admin-filters">
        <div className="filter-search">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={buscaTitulo}
            onChange={(e) => setBuscaTitulo(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-selects">
          <select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)} className="filter-select">
            <option value="">Todos os anos</option>
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
          <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="filter-select">
            <option value="">Todos os meses</option>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
          {(buscaTitulo || filtroAno || filtroMes) && (
            <button
              className="clear-filters-btn"
              onClick={() => {
                setBuscaTitulo('')
                setFiltroAno('')
                setFiltroMes('')
              }}
              title="Limpar filtros"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {loading && <div className="loading-state">Carregando entregas...</div>}
      {error && <div className="error-state">{error}</div>}

      <div className="admin-list">
        {marcosFiltrados.length === 0 ? (
          <div className="empty-list">
            <p>Nenhuma entrega encontrada com este status.</p>
          </div>
        ) : (
          marcosFiltrados.map((marco) => (
            <div key={marco.id} className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3>{marco.titulo}</h3>
                  <div className="badges">
                    <span className={`status-badge ${getStatusClass(marco.statusId)}`}>
                      {getStatusLabel(marco.statusId)}
                    </span>
                    <span
                      className="type-badge"
                      style={{ backgroundColor: marco.typeId === 1 ? '#2563eb' : marco.typeId === 2 ? '#059669' : '#dc2626' }}
                    >
                      {getTypeIcon(marco.typeId)} {getTypeLabel(marco.typeId)}
                    </span>
                  </div>
                </div>
                <span className="card-date">{formatarData(marco.data)}</span>
              </div>

              <div className="card-footer">
                <div className="card-info">
                  {marco.squads && marco.squads.trim() && (
                    <div className="card-squads">
                      <span className="squads-label">Squads:</span>
                      {marco.squads.split(',').map((squad, index) => (
                        <span key={index} className="squad-tag">{squad.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  {(marco.statusId === 1 || marco.statusId === 2) && (
                    <button onClick={() => handleEditar(marco.id)} className="btn-editar-admin" disabled={processando === marco.id}>
                      Editar
                    </button>
                  )}

                  {marco.statusId === 3 && (
                    <button onClick={() => handleExcluir(marco)} className="btn-excluir-admin" disabled={processando === marco.id}>
                      {processando === marco.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  )}

                  {(marco.statusId === 1 || marco.statusId === 3) && (
                    <button onClick={() => handleAprovar(marco)} className="btn-aprovar" disabled={processando === marco.id}>
                      {processando === marco.id ? 'Processando...' : 'Aprovar'}
                    </button>
                  )}

                  {(marco.statusId === 1 || marco.statusId === 2) && (
                    <button onClick={() => handleRejeitar(marco)} className="btn-rejeitar" disabled={processando === marco.id}>
                      {processando === marco.id ? 'Processando...' : 'Rejeitar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Admin
