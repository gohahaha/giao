import request from '@/utils/request'

const BASE = '/order'

export function getOrderList(params) {
  return request.get(BASE + '/orders/search', { params })
}

export function addOrder(data) {
  return request.post(BASE + '/orders', data)
}

export function updateOrder(id, data) {
  return request.put(BASE + '/orders/' + id, data)
}

export function deleteOrder(id) {
  return request.delete(BASE + '/orders/' + id)
}

export function batchDeleteOrders(ids) {
  return request.post(BASE + '/orders/batchDelete', ids)
}
