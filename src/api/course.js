import request from './request'

export function createCourse(data) {
  return request({ url: '/courses', method: 'post', data })
}

export function updateCourse(id, data) {
  return request({ url: `/courses/${id}`, method: 'put', data })
}

export function deleteCourse(id) {
  return request({ url: `/courses/${id}`, method: 'delete' })
}

export function getCoursePage(params) {
  return request({ url: '/courses/page', method: 'get', params })
}

export function getAvailableCourses(params) {
  return request({ url: '/courses/available', method: 'get', params })
}

export function getCourseDetail(id) {
  return request({ url: `/courses/${id}`, method: 'get' })
}

export function getCourseStudents(id, params) {
  return request({ url: `/courses/${id}/students`, method: 'get', params })
}
