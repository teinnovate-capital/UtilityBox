/* sec/stores/user.ts */

import { defineStore } from 'pinia'

interface UserState {
  userId: string | null
  detailsSec: string | null
  statusCode: number | null
  response: any | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userId: localStorage.getItem('userId'),
    detailsSec: localStorage.getItem('detailsSec'),
    statusCode: localStorage.getItem('statusCode')
      ? Number(localStorage.getItem('statusCode'))
      : null,
    response: JSON.parse(localStorage.getItem('userresponse') || 'null')
  }),
  actions: {
    setUser(response: any, email?: string) {
      this.userId = response.details
      this.detailsSec = response.details_sec || null
      this.statusCode = response.statuscode ?? null
      this.response = response

      // persist to localStorage
      localStorage.setItem('userId', this.userId || '')
      if (this.detailsSec) localStorage.setItem('detailsSec', this.detailsSec)
      if (this.statusCode !== null) localStorage.setItem('statusCode', String(this.statusCode))
      localStorage.setItem('userresponse', JSON.stringify(response))

      if (email) {
        localStorage.setItem('email', email)
      }
    },
    clearUser() {
      this.userId = null
      this.detailsSec = null
      this.statusCode = null
      this.response = null

      localStorage.removeItem('userId')
      localStorage.removeItem('detailsSec')
      localStorage.removeItem('statusCode')
      localStorage.removeItem('userresponse')
      localStorage.removeItem('email')
    }
  }
})
