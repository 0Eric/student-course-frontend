import request from './request'

export function saveScore(data) {
  return request({ url: '/scores', method: 'post', data })
}

export function updateScore(data) {
  return request({ url: '/scores', method: 'put', data })
}

export function getMyScores(params) {
  return request({ url: '/scores/my', method: 'get', params })
}

export function getCourseScores(courseId, params) {
  return request({ url: `/scores/course/${courseId}`, method: 'get', params })
}

export function getClassScoreStats(classId, params) {
  return request({ url: `/scores/class-stats/${classId}`, method: 'get', params })
}
