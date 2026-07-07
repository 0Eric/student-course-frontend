import { defineStore } from 'pinia'
import { login, register, getCurrentUser } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    roles: []
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    roleCodes: (state) => state.roles.map(r => typeof r === 'string' ? r : r.roleCode || r),
    isStudent: (state) => {
      const codes = state.roles.map(r => typeof r === 'string' ? r : r.roleCode || r)
      return codes.includes('STUDENT')
    },
    isMonitor: (state) => {
      const codes = state.roles.map(r => typeof r === 'string' ? r : r.roleCode || r)
      return codes.includes('MONITOR')
    },
    isTeacher: (state) => {
      const codes = state.roles.map(r => typeof r === 'string' ? r : r.roleCode || r)
      return codes.includes('TEACHER')
    },
    isPrincipal: (state) => {
      const codes = state.roles.map(r => typeof r === 'string' ? r : r.roleCode || r)
      return codes.includes('PRINCIPAL')
    }
  },
  actions: {
    async loginAction(loginForm) {
      const res = await login(loginForm)
      this.token = res.data.token
      this.userInfo = res.data
      this.roles = res.data.roles || []
      localStorage.setItem('token', this.token)
      return res
    },
    async registerAction(registerForm) {
      return await register(registerForm)
    },
    async fetchUserInfo() {
      const res = await getCurrentUser()
      this.userInfo = res.data
      this.roles = res.data.roles || []
      return res
    },
    logout() {
      this.token = ''
      this.userInfo = null
      this.roles = []
      localStorage.removeItem('token')
    }
  }
})
