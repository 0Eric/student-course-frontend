import { defineStore } from 'pinia'

export const useCourseStore = defineStore('course', {
  state: () => ({
    currentCourse: null,
    courseList: []
  }),
  actions: {
    setCurrentCourse(course) {
      this.currentCourse = course
    }
  }
})
