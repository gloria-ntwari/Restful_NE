import api from './index';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  getUsers: (page = 1, limit = 10) => api.get(`/auth/users?page=${page}&limit=${limit}`),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const parkingApi = {
  getAll: (page = 1, limit = 10) => api.get(`/parkings?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/parkings/${id}`),
  create: (data) => api.post('/parkings', data),
  update: (id, data) => api.put(`/parkings/${id}`, data),
  delete: (id) => api.delete(`/parkings/${id}`),
};

export const entryApi = {
  getAll: (page = 1, limit = 10) => api.get(`/entries?page=${page}&limit=${limit}`),
  create: (data) => api.post('/entries', data),
  exit: (id) => api.put(`/entries/${id}/exit`),
  getTicket: (id) => api.get(`/entries/${id}/ticket`),
};

export const billingApi = {
  getAll: (page = 1, limit = 10) => api.get(`/bills?page=${page}&limit=${limit}`),
  getById: (entryId) => api.get(`/bills/${entryId}`),
};

export const reportApi = {
  getOutgoing: (start, end, page = 1, limit = 10) => 
    api.get(`/reports/outgoing?start=${start}&end=${end}&page=${page}&limit=${limit}`),
  getEntries: (start, end, page = 1, limit = 10) => 
    api.get(`/reports/entries?start=${start}&end=${end}&page=${page}&limit=${limit}`),
};
