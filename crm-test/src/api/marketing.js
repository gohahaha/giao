import request from '@/utils/request'

const BASE = '/marketing'

export function getMarketingList(params) {
  return request.get(BASE + '/activities/search', { params })
}

export function addMarketing(data) {
  return request.post(BASE + '/activities', data)
}

export function updateMarketing(id, data) {
  return request.put(BASE + '/activities/' + id, data)
}

export function deleteMarketing(id) {
  return request.delete(BASE + '/activities/' + id)
}

export function batchDeleteMarketings(ids) {
  return request.post(BASE + '/activities/batchDelete', ids)
}
