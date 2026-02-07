import { createContext, useContext, useState, useEffect } from 'react'
import { goalService } from '../services/goalService'
import { useAuth } from './AuthContext'

const MarcosContext = createContext()

export const useMarcosContext = () => {
  const context = useContext(MarcosContext)
  if (!context) {
    throw new Error('useMarcosContext deve ser usado dentro de MarcosProvider')
  }
  return context
}

export const MarcosProvider = ({ children }) => {
  const [marcos, setMarcos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const carregarMarcos = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await goalService.getAll()
      // Mapeia os dados da API para o formato do componente
      const marcosFormatados = data.map(goal => ({
        id: goal.id.toString(),
        titulo: goal.title,
        descricao: goal.description,
        highlights: goal.highlights || '',
        data: goal.deliveryAt?.split('T')[0] || goal.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        usuario: goal.applicant || 'Usuário',
        cor: getColorByType(goal.typeId),
        statusId: goal.statusId,
        typeId: goal.typeId,
        userId: goal.userId,
        squad: goal.squad || '', // String
        squads: goal.squad || '', // String
        customer: goal.customer || '',
        applicant: goal.applicant || '', // Aplicação
        highlighted: goal.highlighted || false,
        descriptionGeneratedIA: goal.descriptionGeneratedIA || false
      }))
      setMarcos(marcosFormatados)
    } catch (err) {
      console.error('Erro ao carregar entregas:', err)
      setError('Erro ao carregar entregas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarMarcos()
  }, [])

  const getColorByType = (typeId) => {
    // Todos os tipos usam a mesma cor azul
    return '#2563eb'
  }

  const adicionarMarco = async (marco) => {
    setLoading(true)
    setError(null)
    try {
      console.log('MarcosContext.adicionarMarco - Iniciando com dados:', marco)
      const response = await goalService.create(marco)
      console.log('MarcosContext.adicionarMarco - Sucesso! Response:', response)
      await carregarMarcos()
      console.log('MarcosContext.adicionarMarco - Marcos recarregados')
      return response
    } catch (err) {
      console.error('MarcosContext.adicionarMarco - ERRO:', err)
      console.error('MarcosContext.adicionarMarco - Detalhes do erro:', err.response)
      setError('Erro ao adicionar marco')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const editarMarco = async (id, marcoAtualizado) => {
    setLoading(true)
    setError(null)
    try {
      const goalData = {
        id: parseInt(id),
        ...marcoAtualizado
      }
      
      console.log('Enviando dados para atualização:', goalData)
      const response = await goalService.update(goalData)
      console.log('Resposta da atualização:', response)
      await carregarMarcos()
    } catch (err) {
      console.error('Erro completo ao editar marco:', err)
      console.error('Resposta do erro:', err.response)
      console.error('Status do erro:', err.response?.status)
      console.error('Dados do erro:', err.response?.data)
      setError('Erro ao editar marco')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const excluirMarco = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await goalService.delete(parseInt(id))
      await carregarMarcos()
    } catch (err) {
      console.error('Erro ao excluir marco:', err)
      setError('Erro ao excluir marco')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const obterMarco = (id) => {
    return marcos.find(m => m.id === id)
  }

  return (
    <MarcosContext.Provider value={{
      marcos,
      loading,
      error,
      adicionarMarco,
      editarMarco,
      excluirMarco,
      obterMarco,
      carregarMarcos
    }}>
      {children}
    </MarcosContext.Provider>
  )
}
