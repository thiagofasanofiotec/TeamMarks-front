import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMarcosContext } from '../context/MarcosContext'
import { useAuth } from '../context/AuthContext'
import { showAlert } from '../App'
import { goalService } from '../services/goalService'
import './MarcoForm.css'

function MarcoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { adicionarMarco, editarMarco, obterMarco } = useMarcosContext()
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    squads: '', // Campo de texto para squads
    highlights: '',
    data: new Date().toISOString().split('T')[0],
    typeId: 1, // Sistemas por padrão
    statusId: 1, // Status pendente por padrão
    customer: '', // Área fim como texto
    applicant: '', // Aplicação
    highlighted: false // Marco em destaque
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [squadsDisponiveis, setSquadsDisponiveis] = useState([])

  // Busca squads da API do Azure DevOps
  useEffect(() => {
    const carregarSquads = async () => {
      try {
        const response = await goalService.getSquads()
        console.log('Squads retornados da API:', response)
        // A API retorna { count: X, data: [...] }
        if (response && Array.isArray(response.data)) {
          setSquadsDisponiveis(response.data)
        } else {
          setSquadsDisponiveis([])
        }
      } catch (error) {
        console.error('Erro ao carregar squads:', error)
        setSquadsDisponiveis([])
      }
    }
    carregarSquads()
  }, [])

  useEffect(() => {
    if (id) {
      const marco = obterMarco(id)
      if (marco) {
        setFormData(prev => ({
          ...prev,
          titulo: marco.title || marco.titulo || '',
          descricao: marco.description || marco.descricao || '',
          highlights: marco.highlights || '',
          data: marco.deliveryAt ? marco.deliveryAt.split('T')[0] : (marco.data || new Date().toISOString().split('T')[0]),
          typeId: marco.typeId || 1,
          statusId: marco.statusId || 1,
          squads: marco.squad || marco.squads || '', // API retorna squad como string
          customer: marco.customer || '',
          applicant: marco.applicant || '',
          highlighted: marco.highlighted || false
        }))
      }
    }
  }, [id, obterMarco])



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
    
    if (!formData.squads || !formData.squads.trim()) {
      newErrors.squads = 'Informe pelo menos um squad'
    }
    
    if (!formData.customer || !formData.customer.trim()) {
      newErrors.customer = 'Informe a área fim'
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
      // Mapeia os dados do formulário para o formato que a API espera
      const dataToSend = {
        title: formData.titulo,
        description: formData.descricao,
        highlights: formData.highlights,
        deliveryAt: formData.data,
        typeId: formData.typeId,
        statusId: formData.statusId,
        squad: formData.squads, // String com squads separados por vírgula
        customer: formData.customer, // Área fim
        applicant: formData.applicant, // Aplicação
        highlighted: formData.highlighted === true // Boolean
      }
      
      console.log('MarcoForm.handleSubmit - Dados a enviar:', dataToSend)
      
      if (id) {
        console.log('MarcoForm.handleSubmit - Editando marco ID:', id)
        await editarMarco(id, dataToSend)
        console.log('MarcoForm.handleSubmit - Marco editado com sucesso!')
        showAlert('Marco atualizado com sucesso!', 'success')
      } else {
        console.log('MarcoForm.handleSubmit - Criando novo marco')
        await adicionarMarco(dataToSend)
        console.log('MarcoForm.handleSubmit - Marco criado com sucesso!')
        showAlert('Marco criado e enviado para aprovação!', 'success')
      }
      navigate('/')
    } catch (error) {
      console.error('MarcoForm.handleSubmit - ERRO CAPTURADO:', error)
      console.error('MarcoForm.handleSubmit - Stack trace:', error.stack)
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
          <label htmlFor="customer">Área Fim *</label>
          <small className="form-hint">Informe a área de negócio beneficiada</small>
          <input
            type="text"
            id="customer"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            placeholder="Ex: Diretoria de TI, Área de Compras..."
            className={errors.customer ? 'error' : ''}
          />
          {errors.customer && <span className="error-message">{errors.customer}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="applicant">Aplicação</label>
          <input
            type="text"
            id="applicant"
            name="applicant"
            value={formData.applicant}
            onChange={handleChange}
            placeholder="Ex: Sistema de Compras, Portal RH..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="squads">Squad(s) Participantes *</label>
          <select
            id="squads"
            name="squads"
            value={formData.squads}
            onChange={handleChange}
            className={errors.squads ? 'error' : ''}
          >
            <option value="">Selecione um squad</option>
            {squadsDisponiveis.map((squad, index) => (
              <option key={index} value={squad}>{squad}</option>
            ))}
          </select>
          {errors.squads && <span className="error-message">{errors.squads}</span>}
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
                <span className="type-icon" style={{ backgroundColor: '#2563eb' }}>🖥️</span>
                <span className="type-text">
                  <strong>Sistemas</strong>
                  <small>Desenvolvimento de sistemas</small>
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
                <span className="type-icon" style={{ backgroundColor: '#2563eb' }}>⚙️</span>
                <span className="type-text">
                  <strong>Infra</strong>
                  <small>Infraestrutura e operações</small>
                </span>
              </span>
            </label>
            <label className="type-option">
              <input
                type="radio"
                name="typeId"
                value="3"
                checked={formData.typeId === 3 || formData.typeId === '3'}
                onChange={(e) => setFormData(prev => ({ ...prev, typeId: parseInt(e.target.value) }))}
              />
              <span className="type-label">
                <span className="type-icon" style={{ backgroundColor: '#2563eb' }}>🔒</span>
                <span className="type-text">
                  <strong>DevSecops</strong>
                  <small>Segurança e DevOps</small>
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="highlighted"
              name="highlighted"
              checked={formData.highlighted}
              onChange={(e) => setFormData(prev => ({ ...prev, highlighted: e.target.checked }))}
              className="checkbox-input"
            />
            <span className="checkbox-text">
              ⭐ Marcar como Destaque
              <small className="checkbox-hint">Este marco será destacado na timeline</small>
            </span>
          </label>
        </div>

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
