import request from './request'

export function getUserPage(params) {
  return request({ url: '/users/page', method: 'get', params })
}

export function getUserById(id) {
  return request({ url: `/users/${id}`, method: 'get' })
}

export function updateUser(id, data) {
  return request({ url: `/users/${id}`, method: 'put', data })
}

export function updateUserStatus(id, status) {
  return request({ url: `/users/${id}/status`, method: 'put', data: { status } })
}

export function assignRole(id, roleId) {
  return request({ url: `/users/${id}/role`, method: 'put', data: { roleId } })
}
