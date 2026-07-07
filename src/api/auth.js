import request from './request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

export function getCurrentUser() {
  return request({
    url: '/auth/me',
    method: 'get'
  })
}

export function updatePassword(data) {
  return request({
    url: '/auth/password',
    method: 'put',
    data
  })
}

export function updateProfile(data) {
  return request({
    url: '/auth/profile',
    method: 'put',
    data
  })
}
