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
        squadIds: Array.isArray(goal.squads) ? goal.squads.map(s => s.id) : [],
        squads: goal.squads || [],
        customerId: goal.customerId,
        customerName: goal.customerName,
        customerFeedback: goal.customerFeedback || ''
      }))
      setMarcos(marcosFormatados)
    } catch (err) {
      console.error('Erro ao carregar marcos:', err)
      setError('Erro ao carregar marcos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarMarcos()
  }, [])

  const getColorByType = (typeId) => {
    const colors = {
      1: '#2563eb', // Projeto - Azul
      2: '#059669', // Melhoria - Verde
    }
    return colors[typeId] || '#64748b'
  }

  const adicionarMarco = async (marco) => {
    setLoading(true)
    setError(null)
    try {
      const goalData = {
        typeId: marco.typeId || 1,
        statusId: marco.statusId || 1,
        userId: user?.id || 1,
        title: marco.titulo,
        description: marco.descricao,
        applicant: (marco.typeId === 2 || marco.typeId === '2') && marco.sistema ? marco.sistema : (marco.usuario || ''),
        highlights: marco.highlights || '',
        squadIds: Array.isArray(marco.squadIds) ? marco.squadIds : [],
        deliveryAt: marco.data ? new Date(marco.data).toISOString() : new Date().toISOString(),
        customerId: marco.customerId ? parseInt(marco.customerId) : null,
        customerFeedback: marco.customerFeedback || ''
      }
      
      await goalService.create(goalData)
      await carregarMarcos()
    } catch (err) {
      console.error('Erro ao adicionar marco:', err)
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
        typeId: marcoAtualizado.typeId || 1,
        statusId: marcoAtualizado.statusId || 1,
        userId: marcoAtualizado.userId || user?.id || 1,
        title: marcoAtualizado.titulo,
        description: marcoAtualizado.descricao,
        applicant: (marcoAtualizado.typeId === 2 || marcoAtualizado.typeId === '2') && marcoAtualizado.sistema ? marcoAtualizado.sistema : (marcoAtualizado.usuario || ''),
        highlights: marcoAtualizado.highlights || '',
        squadIds: Array.isArray(marcoAtualizado.squadIds) ? marcoAtualizado.squadIds : [],
        deliveryAt: marcoAtualizado.data ? new Date(marcoAtualizado.data).toISOString() : new Date().toISOString(),
        customerId: marcoAtualizado.customerId ? parseInt(marcoAtualizado.customerId) : null,
        customerFeedback: marcoAtualizado.customerFeedback || ''
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
