import request from '@/utils/request'

const BASE = '/system'

export function getUserList() {
  return request.get(BASE + '/users')
}

export function addUser(data) {
  return request.post(BASE + '/users', data)
}

export function updateUser(id, data) {
  return request.put(BASE + '/users/' + id, data)
}

export function deleteUser(id) {
  return request.delete(BASE + '/users/' + id)
}
