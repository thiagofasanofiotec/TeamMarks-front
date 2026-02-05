import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMarcosContext } from '../context/MarcosContext'
import { useAuth } from '../context/AuthContext'
import { showAlert } from '../App'
import api from '../services/api'
import './MarcoForm.css'

function MarcoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { adicionarMarco, editarMarco, obterMarco } = useMarcosContext()
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    squadIds: [],
    highlights: '',
    data: new Date().toISOString().split('T')[0],
    typeId: 1, // Projeto por padrão
    statusId: 1, // Status pendente por padrão
    sistema: '', // Sistema para melhorias
    customerId: '', // Área fim
    customerFeedback: '' // Feedback final do usuário
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [squads, setSquads] = useState([])
  const [loadingSquads, setLoadingSquads] = useState(false)
  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  useEffect(() => {
    if (id) {
      const marco = obterMarco(id)
      if (marco) {
        setFormData(prev => ({
          ...prev,
          ...marco,
          squadIds: Array.isArray(marco.squadIds) ? marco.squadIds : (marco.squadId ? [marco.squadId] : []),
          customerFeedback: marco.customerFeedback || ''
        }))
      }
    }
  }, [id, obterMarco])

  useEffect(() => {
    const carregarSquads = async () => {
      setLoadingSquads(true)
      try {
        const response = await api.get('/squad')
        setSquads(response.data)
      } catch (error) {
        console.error('Erro ao carregar squads:', error)
      } finally {
        setLoadingSquads(false)
      }
    }
    carregarSquads()
  }, [])

  useEffect(() => {
    const carregarCustomers = async () => {
      setLoadingCustomers(true)
      try {
        const response = await api.get('/customer')
        setCustomers(response.data)
      } catch (error) {
        console.error('Erro ao carregar customers:', error)
      } finally {
        setLoadingCustomers(false)
      }
    }
    carregarCustomers()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSquadToggle = (squadId) => {
    setFormData(prev => {
      const squadIds = prev.squadIds || []
      const isSelected = squadIds.includes(squadId)
      return {
        ...prev,
        squadIds: isSelected 
          ? squadIds.filter(id => id !== squadId)
          : [...squadIds, squadId]
      }
    })
    // Limpa erro ao selecionar
    if (errors.squadIds) {
      setErrors(prev => ({ ...prev, squadIds: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'O título é obrigatório'
    }
    
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'A descrição é obrigatória'
    }
    
    if (!formData.data) {
      newErrors.data = 'A data da entrega é obrigatória'
    }
    
    if (!formData.squadIds || formData.squadIds.length === 0) {
      newErrors.squadIds = 'Selecione pelo menos um squad'
    }
    
    if (!formData.customerId) {
      newErrors.customerId = 'Selecione a área fim'
    }
    
    if ((formData.typeId === 2 || formData.typeId === '2') && !formData.sistema) {
      newErrors.sistema = 'Selecione o sistema para a melhoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      if (id) {
        await editarMarco(id, formData)
        showAlert('Marco atualizado com sucesso!', 'success')
      } else {
        await adicionarMarco(formData)
        showAlert('Marco criado e enviado para aprovação!', 'success')
      }
      navigate('/')
    } catch (error) {
      const errorMsg = id ? 'Erro ao atualizar marco. Tente novamente.' : 'Erro ao criar marco. Tente novamente.'
      setSubmitError(errorMsg)
      showAlert(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  // Verifica se o usuário tem permissão
  // Contribuidor: só pode criar novos marcos
  // Aprovador: pode editar marcos aprovados
  if (user?.roleId === 'Contribuidor' && id) {
    return (
      <div className="form-container">
        <div className="access-denied">
          <h2>Acesso Negado</h2>
          <p>Contribuidores não podem editar entregas aprovadas.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Voltar para Timeline
          </button>
        </div>
      </div>
    )
  }

  if (!user?.roleId || (user.roleId !== 'Contribuidor' && user.roleId !== 'Aprovador')) {
    return (
      <div className="form-container">
        <div className="access-denied">
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta página.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Voltar para Timeline
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="form-container">
      <h2>{id ? 'Editar Entrega' : 'Nova Entrega'}</h2>
      
      {!id && (
        <div className="info-alert">
          📄 Sua entrega será enviada para aprovação do administrador antes de aparecer na timeline.
        </div>
      )}
      
      {submitError && <div className="error-alert">{submitError}</div>}
      
      <form onSubmit={handleSubmit} className="marco-form">
        <div className="form-group">
          <label htmlFor="titulo">Título *</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ex: Lançamento do Produto"
            className={errors.titulo ? 'error' : ''}
          />
          {errors.titulo && <span className="error-message">{errors.titulo}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição *</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descreva a entrega realizada..."
            rows="4"
            className={errors.descricao ? 'error' : ''}
          />
          {errors.descricao && <span className="error-message">{errors.descricao}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="highlights">Destaques</label>
          <textarea
            id="highlights"
            name="highlights"
            value={formData.highlights}
            onChange={handleChange}
            placeholder="Principais conquistas e destaques (opcional)..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="customerFeedback">Feedback Final do Usuário</label>
          <textarea
            id="customerFeedback"
            name="customerFeedback"
            value={formData.customerFeedback}
            onChange={handleChange}
            placeholder="Descreva o feedback recebido do usuário final (opcional)..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="data">Data da Entrega *</label>
          <input
            type="date"
            id="data"
            name="data"
            value={formData.data || ''}
            onChange={handleChange}
            className={errors.data ? 'error' : ''}
          />
          {errors.data && <span className="error-message">{errors.data}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="customerId">Área Fim *</label>
          <small className="form-hint">Selecione a área de negócio beneficiada</small>
          {loadingCustomers ? (
            <div className="loading-customers">Carregando áreas...</div>
          ) : (
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              className={errors.customerId ? 'error' : ''}
            >
              <option value="">Selecione uma área</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          )}
          {errors.customerId && <span className="error-message">{errors.customerId}</span>}
        </div>

        <div className="form-group">
          <label>Selecione a(s) Squad(s) Participantes *</label>
          <small className="form-hint">Você pode selecionar um ou mais squads</small>
          {loadingSquads ? (
            <div className="loading-squads">Carregando squads...</div>
          ) : (
            <div className={`squads-checkbox-group ${errors.squadIds ? 'error' : ''}`}>
              {squads.length === 0 ? (
                <div className="empty-squads">Nenhum squad disponível</div>
              ) : (
                squads.map(squad => (
                  <label key={squad.id} className="squad-checkbox-item">
                    <input
                      type="checkbox"
                      checked={(formData.squadIds || []).includes(squad.id)}
                      onChange={() => handleSquadToggle(squad.id)}
                    />
                    <span className="squad-checkbox-label">{squad.name}</span>
                  </label>
                ))
              )}
            </div>
          )}
          {errors.squadIds && <span className="error-message">{errors.squadIds}</span>}
          {formData.squadIds && formData.squadIds.length > 0 && (
            <div className="selected-squads-count">
              {formData.squadIds.length} squad{formData.squadIds.length > 1 ? 's' : ''} selecionado{formData.squadIds.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Tipo da Entrega *</label>
          <div className="type-selector">
            <label className="type-option">
              <input
                type="radio"
                name="typeId"
                value="1"
                checked={formData.typeId === 1 || formData.typeId === '1'}
                onChange={(e) => setFormData(prev => ({ ...prev, typeId: parseInt(e.target.value) }))}
              />
              <span className="type-label">
                <span className="type-icon" style={{ backgroundColor: '#2563eb' }}>📦</span>
                <span className="type-text">
                  <strong>Projeto</strong>
                  <small>Novos projetos e iniciativas</small>
                </span>
              </span>
            </label>
            <label className="type-option">
              <input
                type="radio"
                name="typeId"
                value="2"
                checked={formData.typeId === 2 || formData.typeId === '2'}
                onChange={(e) => setFormData(prev => ({ ...prev, typeId: parseInt(e.target.value) }))}
              />
              <span className="type-label">
                <span className="type-icon" style={{ backgroundColor: '#059669' }}>⚡</span>
                <span className="type-text">
                  <strong>Melhoria</strong>
                  <small>Melhorias e otimizações</small>
                </span>
              </span>
            </label>
          </div>
        </div>

        {(formData.typeId === 2 || formData.typeId === '2') && (
          <div className="form-group">
            <label htmlFor="sistema">Sistema *</label>
            <small className="form-hint">Selecione o sistema que recebeu a melhoria</small>
            <select
              id="sistema"
              name="sistema"
              value={formData.sistema}
              onChange={handleChange}
              className={errors.sistema ? 'error' : ''}
            >
              <option value="">Selecione um sistema</option>
              <option value="Sistema A">Sistema A</option>
              <option value="Sistema B">Sistema B</option>
              <option value="Sistema C">Sistema C</option>
            </select>
            {errors.sistema && <span className="error-message">{errors.sistema}</span>}
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-cancel" disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Salvando...' : (id ? 'Salvar Alterações' : 'Criar Entrega')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MarcoForm
