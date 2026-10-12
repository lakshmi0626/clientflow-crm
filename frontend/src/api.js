const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
async function request(path, options = {}) {
  let response
  try { response = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options }) }
  catch { throw new Error(`Cannot reach the API at ${BASE}. Make sure the backend is running on port 8080.`) }
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try { const body = await response.json(); message = body.message || body.detail || message } catch { try { message = (await response.text()) || message } catch {} }
    throw new Error(message)
  }
  if (response.status === 204) return null
  return response.json()
}
export const api = {
  dashboard: () => request('/dashboard'),
  leads: () => request('/leads'),
  createLead: data => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateLeadStatus: (id, status) => request(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteLead: id => request(`/leads/${id}`, { method: 'DELETE' }),
  customers: () => request('/customers'),
  createCustomer: data => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: id => request(`/customers/${id}`, { method: 'DELETE' }),
  tasks: () => request('/tasks'),
  createTask: data => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: id => request(`/tasks/${id}`, { method: 'DELETE' })
}
