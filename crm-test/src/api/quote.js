import request from '@/utils/request'

const BASE = '/quote'

export function getQuoteList(params) {
  return request.get(BASE + '/quotes/search', { params })
}

export function addQuote(data) {
  return request.post(BASE + '/quotes', data)
}

export function updateQuote(id, data) {
  return request.put(BASE + '/quotes/' + id, data)
}

export function deleteQuote(id) {
  return request.delete(BASE + '/quotes/' + id)
}

export function batchDeleteQuotes(ids) {
  return request.post(BASE + '/quotes/batchDelete', ids)
}
