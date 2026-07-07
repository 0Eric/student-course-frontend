import request from './request'

export function getEnrollmentStats() {
  return request({ url: '/statistics/enrollment-stats', method: 'get' })
}

export function getSchoolScores(params) {
  return request({ url: '/statistics/school-scores', method: 'get', params })
}

export function getClassScoreReport(classId, params) {
  return request({ url: `/scores/class-stats/${classId}`, method: 'get', params })
}

export function getDashboardStats() {
  return request({ url: '/statistics/dashboard', method: 'get' })
}
