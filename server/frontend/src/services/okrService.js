import apiClient from './apiClient'

export const getOkrs = (filters = {}) =>
    apiClient.get('/okr', { params: filters }).then((r) => r.data)

export const getMyOkrs = (employeeId) =>
    apiClient.get('/okr/mine', { params: { employeeId } }).then((r) => r.data)

export const getOkrById = (id) =>
    apiClient.get(`/okr/${id}`).then((r) => r.data)

export const createOkr = (data) =>
    apiClient.post('/okr', data).then((r) => r.data)

export const updateOkr = ({ id, ...data }) =>
    apiClient.patch(`/okr/${id}`, data).then((r) => r.data)

export const updateOkrProgress = ({ id, currentValue }) =>
    apiClient.patch(`/okr/${id}/progress`, { currentValue }).then((r) => r.data)
