import api from './api'

export const goalService = {
  getAll: async () => {
    const response = await api.get('/Goal')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/Goal/${id}`)
    return response.data
  },

  create: async (goalData) => {
    const response = await api.post('/Goal', goalData)
    return response.data
  },

  update: async (goalData) => {
    const response = await api.put(`/Goal/${goalData.id}`, goalData)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/Goal/${id}`)
    return response.data
  }
}
