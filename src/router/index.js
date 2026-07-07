import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/login/Register.vue')
  },
  {
    path: '/dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard/home',
    children: [
      {
        path: 'home',
        name: 'DashboardHome',
        component: () => import('@/views/dashboard/Home.vue')
      },
      // 学生路由
      {
        path: 'courses',
        name: 'CourseSquare',
        component: () => import('@/views/course/CourseSquare.vue')
      },
      {
        path: 'my-courses',
        name: 'MyCourses',
        component: () => import('@/views/course/MyCourses.vue')
      },
      {
        path: 'my-scores',
        name: 'MyScores',
        component: () => import('@/views/course/MyScores.vue')
      },
      // 班干部路由
      {
        path: 'class/manage',
        name: 'ClassManage',
        component: () => import('@/views/class/ClassManage.vue')
      },
      {
        path: 'class/enrollment',
        name: 'ClassEnrollment',
        component: () => import('@/views/class/ClassEnrollment.vue')
      },
      {
        path: 'class/scores',
        name: 'ClassScores',
        component: () => import('@/views/class/ClassScores.vue')
      },
      // 老师路由
      {
        path: 'teacher/courses',
        name: 'TeacherCourses',
        component: () => import('@/views/teacher/TeacherCourses.vue')
      },
      {
        path: 'teacher/scores',
        name: 'TeacherScores',
        component: () => import('@/views/teacher/TeacherScores.vue')
      },
      {
        path: 'teacher/students',
        name: 'TeacherStudents',
        component: () => import('@/views/teacher/TeacherStudents.vue')
      },
      // 校长路由
      {
        path: 'admin/teachers',
        name: 'AdminTeachers',
        component: () => import('@/views/admin/AdminTeachers.vue')
      },
      {
        path: 'admin/scores',
        name: 'AdminScores',
        component: () => import('@/views/admin/AdminScores.vue')
      },
      {
        path: 'admin/reports',
        name: 'AdminReports',
        component: () => import('@/views/admin/AdminReports.vue')
      },
      {
        path: 'admin/enrollment-stats',
        name: 'AdminEnrollmentStats',
        component: () => import('@/views/admin/AdminEnrollmentStats.vue')
      },
      // 个人中心（所有角色共享）
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/Profile.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')

  // 访问需要登录的页面但未登录，跳转登录页
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  // 已登录时访问登录/注册页，跳转仪表盘
  if ((to.path === '/login' || to.path === '/register') && token) {
    next('/dashboard/home')
    return
  }

  // 访问需要登录的页面时，尝试补充用户信息
  if (to.meta.requiresAuth && token) {
    // 通过检查 store 中是否有 userInfo 来判断是否需要 fetch
    const { useUserStore } = await import('@/store/user')
    const userStore = useUserStore()
    if (!userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch (e) {
        // 如果获取用户信息失败（token 无效），清除登录状态并跳转登录页
        userStore.logout()
        next('/login')
        return
      }
    }
  }

  next()
})

export default router
