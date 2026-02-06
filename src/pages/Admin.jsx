import { useState, useEffect } from 'react'
import { useMarcosContext } from '../context/MarcosContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { showConfirm, showAlert } from '../App'
import api from '../services/api'
import './Admin.css'

function Admin() {
  const { marcos, loading, error, editarMarco, excluirMarco, carregarMarcos } = useMarcosContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filtroStatus, setFiltroStatus] = useState('1') // 1: Pendentes por padrão
  const [processando, setProcessando] = useState(null)

  useEffect(() => {
    carregarMarcos()
  }, [])

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
      2: '⚙️',
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

  const marcosFiltrados = marcos.filter(m => {
    if (filtroStatus === 'todos') return true
    return m.statusId === parseInt(filtroStatus)
  })

  const contadores = {
    pendentes: marcos.filter(m => m.statusId === 1).length,
    aprovados: marcos.filter(m => m.statusId === 2).length,
    rejeitados: marcos.filter(m => m.statusId === 3).length
  }

  if (user?.roleId !== 'Aprovador') {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h2>Administração de Entregas</h2>
          <p className="admin-subtitle">Gerencie as solicitações de entregas da equipe</p>
        </div>
      </div>

      <div className="admin-stats">
        <div 
          className={`stat-card pendente ${filtroStatus === '1' ? 'active' : ''}`}
          onClick={() => setFiltroStatus('1')}
        >
          <span className="stat-number">{contadores.pendentes}</span>
          <span className="stat-label">Pendentes</span>
        </div>
        <div 
          className={`stat-card aprovado ${filtroStatus === '2' ? 'active' : ''}`}
          onClick={() => setFiltroStatus('2')}
        >
          <span className="stat-number">{contadores.aprovados}</span>
          <span className="stat-label">Aprovados</span>
        </div>
        <div 
          className={`stat-card rejeitado ${filtroStatus === '3' ? 'active' : ''}`}
          onClick={() => setFiltroStatus('3')}
        >
          <span className="stat-number">{contadores.rejeitados}</span>
          <span className="stat-label">Rejeitados</span>
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
          marcosFiltrados.map(marco => (
            <div key={marco.id} className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3>{marco.titulo}</h3>
                  <div className="badges">
                    <span className={`status-badge ${getStatusClass(marco.statusId)}`}>
                      {getStatusLabel(marco.statusId)}
                    </span>
                    <span className="type-badge" style={{ 
                      backgroundColor: marco.typeId === 1 ? '#2563eb' : marco.typeId === 2 ? '#059669' : '#dc2626' 
                    }}>
                      {getTypeIcon(marco.typeId)} {getTypeLabel(marco.typeId)}
                    </span>
                  </div>
                </div>
                <span className="card-date">{formatarData(marco.data)}</span>
              </div>
              
              <p className="card-description" style={{ whiteSpace: 'pre-wrap' }}>{limparHTML(marco.descricao)}</p>
              
              {marco.highlights && (
                <div className="card-highlights">
                  <strong>Destaques:</strong> <span style={{ whiteSpace: 'pre-wrap' }}>{limparHTML(marco.highlights)}</span>
                </div>
              )}
              
              <div className="card-footer">
                <div className="card-info">
                  {marco.squads && marco.squads.trim() && (
                    <div className="card-squads">
                      <span className="squads-label">👥 Squads:</span>
                      {marco.squads.split(',').map((squad, index) => (
                        <span key={index} className="squad-tag">{squad.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="card-actions">
                  {/* Botão de Editar visível para pendentes e aprovados */}
                  {(marco.statusId === 1 || marco.statusId === 2) && (
                    <button 
                      onClick={() => handleEditar(marco.id)}
                      className="btn-editar-admin"
                      disabled={processando === marco.id}
                    >
                      ✏️ Editar
                    </button>
                  )}
                  
                  {/* Botão de Excluir visível apenas para rejeitados */}
                  {marco.statusId === 3 && (
                    <button 
                      onClick={() => handleExcluir(marco)}
                      className="btn-excluir-admin"
                      disabled={processando === marco.id}
                    >
                      {processando === marco.id ? 'Excluindo...' : '🗑️ Excluir'}
                    </button>
                  )}
                  
                  {/* Botão de Aprovar para pendentes e rejeitados */}
                  {(marco.statusId === 1 || marco.statusId === 3) && (
                    <button 
                      onClick={() => handleAprovar(marco)}
                      className="btn-aprovar"
                      disabled={processando === marco.id}
                    >
                      {processando === marco.id ? 'Processando...' : '✓ Aprovar'}
                    </button>
                  )}
                  
                  {/* Botão de Rejeitar para pendentes e aprovados */}
                  {(marco.statusId === 1 || marco.statusId === 2) && (
                    <button 
                      onClick={() => handleRejeitar(marco)}
                      className="btn-rejeitar"
                      disabled={processando === marco.id}
                    >
                      {processando === marco.id ? 'Processando...' : '✗ Rejeitar'}
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
