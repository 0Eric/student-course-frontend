# 学生课程管理系统 - 前端

> Vue 3 + Element Plus + Pinia + Vue Router 构建的多角色学生课程管理前端应用。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue 3 | ^3.4.0 | 渐进式 JavaScript 框架（Composition API） |
| Element Plus | ^2.7.0 | UI 组件库 |
| Pinia | ^2.1.0 | 状态管理 |
| Vue Router | ^4.3.0 | 路由管理 |
| Axios | ^1.7.0 | HTTP 请求库 |
| Day.js | ^1.11.0 | 日期处理 |
| Vite | ^5.2.0 | 构建工具 |

## 快速启动

```bash
# 安装依赖
npm install

# 开发模式启动（默认端口 5173）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

启动后访问 http://localhost:5173，API 请求会自动代理到 `http://localhost:8080`。

## 演示账号

| 角色 | 账号 | 密码 | 说明 |
|------|------|------|------|
| 校长 | admin | 123456 | 全校管理权限 |
| 教师 | teacher01 | 123456 | 李老师，2024级1班班主任 |
| 教师 | teacher02 | 123456 | 王老师 |
| 班干部 | monitor01 | 123456 | 赵班长（兼具学生权限） |
| 学生 | student01 | 123456 | 陈同学 |

## 目录结构

```
src/
├── api/                    # API 请求模块
│   ├── request.js          # Axios 实例（拦截器、统一错误处理）
│   ├── auth.js             # 认证接口（登录/注册/用户信息/改密）
│   ├── course.js           # 课程接口（增删改查/分页/可用课程）
│   ├── enrollment.js       # 选课接口（选课/退选/我的选课）
│   ├── score.js            # 成绩接口（我的成绩/按学生查/按课程查/班级成绩）
│   ├── classes.js          # 班级接口（分页查询/班级学生）
│   ├── user.js             # 用户接口（分页查询/编辑/状态/角色分配）
│   └── statistics.js       # 统计接口（选课统计/全校成绩/班级报表）
│
├── store/                  # Pinia 状态管理
│   ├── user.js             # 用户状态（登录/登出/用户信息/角色判断）
│   ├── course.js           # 课程状态
│   └── app.js              # 应用状态（侧边栏折叠等）
│
├── views/                  # 页面组件
│   ├── login/              # 登录注册
│   │   ├── Login.vue       # 登录页
│   │   └── Register.vue    # 注册页
│   ├── dashboard/          # 布局框架
│   │   ├── Dashboard.vue   # 主布局（侧边栏 + 顶栏 + 内容区）
│   │   └── Home.vue        # 首页仪表盘
│   ├── course/             # 学生课程模块
│   │   ├── CourseSquare.vue# 课程广场（浏览可选课程）
│   │   ├── MyCourses.vue   # 我的课程（已选课程列表）
│   │   └── MyScores.vue    # 我的成绩（成绩查询）
│   ├── class/              # 班干部管理模块
│   │   ├── ClassManage.vue # 班级管理（班级信息）
│   │   ├── ClassEnrollment.vue # 班级选课（全班选课情况）
│   │   └── ClassScores.vue # 班级成绩（全班成绩统计）
│   ├── teacher/            # 教师管理模块
│   │   ├── TeacherCourses.vue  # 课程管理（增删改查课程）
│   │   ├── TeacherScores.vue   # 成绩管理（录入/修改成绩）
│   │   └── TeacherStudents.vue # 班级学生（查看学生信息）
│   ├── admin/              # 校长管理模块
│   │   ├── AdminTeachers.vue       # 教师管理
│   │   ├── AdminScores.vue         # 全校成绩
│   │   ├── AdminReports.vue        # 班级报表
│   │   └── AdminEnrollmentStats.vue# 选课统计
│   └── profile/            # 个人中心
│       └── Profile.vue     # 个人信息 + 修改密码
│
├── components/             # 通用组件
│   ├── SidebarMenu.vue     # 侧边栏菜单（根据角色动态渲染）
│   ├── NavHeader.vue       # 顶部导航栏
│   ├── SearchForm.vue      # 搜索表单组件
│   ├── FormDialog.vue      # 表单弹窗组件
│   └── TableCard.vue       # 表格卡片组件
│
├── router/
│   └── index.js            # 路由配置 + 路由守卫（登录验证/角色过滤）
│
├── utils/
│   └── auth.js             # Token 管理（localStorage）
│
├── App.vue                 # 根组件
└── main.js                 # 应用入口
```

## 功能模块总览

### 1. 认证模块

| 功能 | 页面 | 说明 |
|------|------|------|
| 用户登录 | Login.vue | 账号密码登录，返回 JWT Token + 用户信息 |
| 用户注册 | Register.vue | 学生自主注册（默认学生角色） |
| 获取当前用户 | - | GET /auth/me，刷新用户信息 |
| 修改密码 | Profile.vue | 验证旧密码后修改新密码 |

### 2. 课程模块

| 功能 | 页面 | 说明 |
|------|------|------|
| 课程广场 | CourseSquare.vue | 学生浏览可选课程，支持关键词搜索 + 分页 |
| 我的课程 | MyCourses.vue | 学生查看已选课程列表，支持退选 |
| 课程管理 | TeacherCourses.vue | 教师创建/编辑/删除课程，支持按名称/学期筛选 |
| 课程详情 | - | 查看课程信息 + 选课学生列表 |

### 3. 选课模块

| 功能 | 页面 | 说明 |
|------|------|------|
| 选课 | CourseSquare.vue | 学生点击"选课"按钮加入课程 |
| 退选 | MyCourses.vue | 学生退选已选课程 |
| 我的选课 | MyCourses.vue | 查看个人选课记录 |
| 班级选课 | ClassEnrollment.vue | 班干部查看全班选课情况 |

### 4. 成绩模块

| 功能 | 页面 | 说明 |
|------|------|------|
| 我的成绩 | MyScores.vue | 学生查看个人成绩列表 |
| 成绩管理 | TeacherScores.vue | 教师录入/修改学生成绩 |
| 班级成绩 | ClassScores.vue | 班干部查看全班成绩 + 统计摘要 |
| 全校成绩 | AdminScores.vue | 校长查看全校成绩概览 |
| 班级报表 | AdminReports.vue | 校长按班级/课程查看成绩报表 |

### 5. 班级管理模块

| 功能 | 页面 | 说明 |
|------|------|------|
| 班级列表 | ClassManage.vue | 班干部查看班级基本信息 |
| 班级学生 | - | 查看班级学生名单 |
| 班级选课统计 | ClassEnrollment.vue | 班级选课人数统计 |

### 6. 用户管理模块

| 功能 | 页面 | 说明 |
|------|------|------|
| 教师管理 | AdminTeachers.vue | 校长查看/编辑教师信息 |
| 学生管理 | TeacherStudents.vue | 教师查看班级学生信息 |
| 状态管理 | - | 校长启用/禁用用户账号 |
| 角色分配 | - | 校长为用户分配角色 |

### 7. 统计分析模块

| 功能 | 页面 | 说明 |
|------|------|------|
| 选课统计 | AdminEnrollmentStats.vue | 校长查看全校选课统计 |
| 全校成绩概览 | AdminScores.vue | 校长查看各年级成绩概览 |
| 班级报表 | AdminReports.vue | 校长按班级 + 课程查看成绩明细 + 统计 |

### 8. 个人中心

| 功能 | 页面 | 说明 |
|------|------|------|
| 个人信息 | Profile.vue | 展示用户名、真实姓名、学号（学生/班干部）、班级、角色 |
| 修改密码 | Profile.vue | 验证旧密码后修改新密码 |

## 四种角色功能权限矩阵

### 学生（STUDENT）

| 菜单 | 页面 | 功能 |
|------|------|------|
| 课程广场 | CourseSquare.vue | 浏览可选课程，搜索筛选，一键选课 |
| 我的课程 | MyCourses.vue | 查看已选课程列表，退选课程 |
| 我的成绩 | MyScores.vue | 查看个人所有课程成绩 |
| 个人中心 | Profile.vue | 查看个人信息（含学号/班级），修改密码 |

### 班干部（MONITOR）

> 班干部同时拥有学生的全部权限，额外增加班级管理功能。

| 菜单 | 页面 | 功能 |
|------|------|------|
| 课程广场 | CourseSquare.vue | （同学生） |
| 我的课程 | MyCourses.vue | （同学生） |
| 我的成绩 | MyScores.vue | （同学生） |
| 班级管理 | ClassManage.vue | 查看班级基本信息 |
| 班级选课 | ClassEnrollment.vue | 查看全班学生选课情况 |
| 班级成绩 | ClassScores.vue | 查看全班成绩列表 + 统计（平均分/最高分/最低分/及格率），支持按课程筛选和姓名搜索 |
| 个人中心 | Profile.vue | （同学生） |

### 教师（TEACHER）

| 菜单 | 页面 | 功能 |
|------|------|------|
| 课程管理 | TeacherCourses.vue | 创建/编辑/删除课程，按名称/学期/状态筛选 |
| 成绩管理 | TeacherScores.vue | 选择课程后录入/修改学生成绩，支持按学生搜索 |
| 班级学生 | TeacherStudents.vue | 查看所教班级学生名单和基本信息 |
| 个人中心 | Profile.vue | 查看个人信息，修改密码 |

### 校长（PRINCIPAL）

| 菜单 | 页面 | 功能 |
|------|------|------|
| 教师管理 | AdminTeachers.vue | 查看全校教师列表，编辑教师信息，启用/禁用账号 |
| 全校成绩 | AdminScores.vue | 查看全校成绩概览，按年级/课程筛选 |
| 班级报表 | AdminReports.vue | 按班级 + 课程查看成绩明细列表 + 统计卡片（学生数/平均分/最高分/最低分/及格率） |
| 选课统计 | AdminEnrollmentStats.vue | 查看全校各课程选课人数统计 |
| 个人中心 | Profile.vue | 查看个人信息，修改密码 |

## 路由守卫

- **未登录**：访问任何 `requiresAuth` 页面自动跳转登录页
- **Token 失效**：API 返回 401 时自动清除 Token 并跳转登录页
- **首次进入**：路由守卫自动调用 `fetchUserInfo()` 获取完整用户信息（含角色/学号/班级）
- **菜单渲染**：`SidebarMenu.vue` 根据角色动态渲染菜单项

## 前后端 API 对应关系

| 前端 API 模块 | 后端 Controller | 基础路径 |
|---------------|-----------------|----------|
| auth.js | AuthController | /api/v1/auth |
| course.js | CourseController | /api/v1/courses |
| enrollment.js | EnrollmentController | /api/v1/enrollments |
| score.js | ScoreController | /api/v1/scores |
| classes.js | ClassesController | /api/v1/classes |
| user.js | UserController | /api/v1/users |
| statistics.js | StatisticsController + ScoreController | /api/v1/statistics + /api/v1/scores |
