import request from '@/utils/request'

const BASE = '/contract'

export function getContractList(params) {
  return request.get(BASE + '/contracts/search', { params })
}

export function addContract(data) {
  return request.post(BASE + '/contracts', data)
}

export function updateContract(id, data) {
  return request.put(BASE + '/contracts/' + id, data)
}

export function deleteContract(id) {
  return request.delete(BASE + '/contracts/' + id)
}

export function batchDeleteContracts(ids) {
  return request.post(BASE + '/contracts/batchDelete', ids)
}
