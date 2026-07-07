import request from './request'

export function enroll(data) {
  return request({ url: '/enrollments', method: 'post', data })
}

export function dropCourse(courseId) {
  return request({ url: `/enrollments/${courseId}`, method: 'delete' })
}

export function getMyEnrollments(params) {
  return request({ url: '/enrollments/my', method: 'get', params })
}

export function getClassEnrollmentStats(params) {
  return request({ url: '/enrollments/class-stats', method: 'get', params })
}
