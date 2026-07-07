export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function getRoles() {
  const roles = localStorage.getItem('roles')
  return roles ? JSON.parse(roles) : []
}

export function setRoles(roles) {
  localStorage.setItem('roles', JSON.stringify(roles))
}
