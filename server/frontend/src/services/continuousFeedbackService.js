import api from './apiClient'

export const getContinuousFeedback = async () => {
    const { data } = await api.get('/continuous-feedback')
    return data
}

export const getContinuousFeedbackById = async (id) => {
    const { data } = await api.get(`/continuous-feedback/${id}`)
    return data
}

export const createContinuousFeedback = async (payload) => {
    const { data } = await api.post('/continuous-feedback', payload)
    return data
}