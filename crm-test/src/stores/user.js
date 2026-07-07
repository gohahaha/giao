import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const realName = ref(localStorage.getItem('realName') || '')

  function setToken(val) {
    token.value = val
    localStorage.setItem('token', val)
  }

  function setUser(name, real) {
    username.value = name
    realName.value = real
    localStorage.setItem('username', name)
    localStorage.setItem('realName', real)
  }

  function logout() {
    token.value = ''
    username.value = ''
    realName.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('realName')
  }

  return { token, username, realName, setToken, setUser, logout }
})
