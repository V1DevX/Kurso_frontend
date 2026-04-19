import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { login } from '@/api/auth'
import useAuthStore from '@/store/authStore'
import ErrorMessage from '@/components/shared/ErrorMessage'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login(form)
      setAuth(data.user, data.accessToken)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-text mb-8">{t('auth.login')}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder={t('auth.email')}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="bg-surface border border-border text-text rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors"
        />
        <input
          type="password"
          placeholder={t('auth.password')}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="bg-surface border border-border text-text rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors"
        />
        <ErrorMessage message={error} />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? t('common.loading') : t('auth.login')}
        </button>
      </form>
      <p className="text-muted text-sm mt-4 text-center">
        <Link to="/register" className="text-accent hover:underline">{t('auth.register')}</Link>
      </p>
    </div>
  )
}
