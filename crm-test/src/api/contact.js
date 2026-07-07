import request from '@/utils/request'

const BASE = '/contact'

export function getContactList(params) {
  return request.get(BASE + '/contacts/search', { params })
}

export function getContactById(id) {
  return request.get(BASE + '/contacts/' + id)
}

export function addContact(data) {
  return request.post(BASE + '/contacts', data)
}

export function updateContact(id, data) {
  return request.put(BASE + '/contacts/' + id, data)
}

export function deleteContact(id) {
  return request.delete(BASE + '/contacts/' + id)
}

export function batchDeleteContacts(ids) {
  return request.post(BASE + '/contacts/batchDelete', ids)
}
