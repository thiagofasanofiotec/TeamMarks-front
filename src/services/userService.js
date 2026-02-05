import api from './api'

export const userService = {
  getById: async (id) => {
    const response = await api.get(`/User/${id}`)
    return response.data
  },

  create: async (userData) => {
    const response = await api.post('/User', userData)
    return response.data
  },

  update: async (id, userData) => {
    const response = await api.put(`/User/${id}`, userData)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/User/${id}`)
    return response.data
  }
}
