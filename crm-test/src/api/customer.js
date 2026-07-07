import request from '@/utils/request'

const BASE = '/customer'

export function getCustomerList(params) {
  return request.get(BASE + '/customers/search', { params })
}

export function getCustomerById(id) {
  return request.get(BASE + '/customers/' + id)
}

export function addCustomer(data) {
  return request.post(BASE + '/customers', data)
}

export function updateCustomer(id, data) {
  return request.put(BASE + '/customers/' + id, data)
}

export function deleteCustomer(id) {
  return request.delete(BASE + '/customers/' + id)
}

export function batchDeleteCustomers(ids) {
  return request.post(BASE + '/customers/batchDelete', ids)
}
