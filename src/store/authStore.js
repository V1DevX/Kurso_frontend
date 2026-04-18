import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem('accessToken', token)
    set({ user, accessToken: token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },
}))

export default useAuthStore
