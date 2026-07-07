import request from '@/utils/request'

const BASE = '/lead'

export function getLeadList(params) {
  return request.get(BASE + '/leads/search', { params })
}

export function addLead(data) {
  return request.post(BASE + '/leads', data)
}

export function updateLead(id, data) {
  return request.put(BASE + '/leads/' + id, data)
}

export function deleteLead(id) {
  return request.delete(BASE + '/leads/' + id)
}

export function batchDeleteLeads(ids) {
  return request.post(BASE + '/leads/batchDelete', ids)
}
