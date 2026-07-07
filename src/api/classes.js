import request from './request'

export function createClass(data) {
  return request({ url: '/classes', method: 'post', data })
}

export function getClassList() {
  return request({ url: '/classes/list-all', method: 'get' })
}

export function getClassPage(params) {
  return request({ url: '/classes/page', method: 'get', params })
}

export function getClassDetail(id) {
  return request({ url: `/classes/${id}`, method: 'get' })
}

export function getClassStudents(id, params) {
  return request({ url: `/classes/${id}/students`, method: 'get', params })
}

export function updateClass(id, data) {
  return request({ url: `/classes/${id}`, method: 'put', data })
}
