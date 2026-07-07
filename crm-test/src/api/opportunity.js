import request from '@/utils/request'

const BASE = '/opportunity'

export function getOpportunityList(params) {
  return request.get(BASE + '/opportunities/search', { params })
}

export function addOpportunity(data) {
  return request.post(BASE + '/opportunities', data)
}

export function updateOpportunity(id, data) {
  return request.put(BASE + '/opportunities/' + id, data)
}

export function deleteOpportunity(id) {
  return request.delete(BASE + '/opportunities/' + id)
}

export function batchDeleteOpportunities(ids) {
  return request.post(BASE + '/opportunities/batchDelete', ids)
}
