import request from '@/utils/request'

const BASE = '/ticket'

export function getTicketList(params) {
  return request.get(BASE + '/tickets/search', { params })
}

export function addTicket(data) {
  return request.post(BASE + '/tickets', data)
}

export function updateTicket(id, data) {
  return request.put(BASE + '/tickets/' + id, data)
}

export function deleteTicket(id) {
  return request.delete(BASE + '/tickets/' + id)
}

export function batchDeleteTickets(ids) {
  return request.post(BASE + '/tickets/batchDelete', ids)
}
