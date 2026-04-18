import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { register } from '../api/auth'
import useAuthStore from '../store/authStore'
import ErrorMessage from '../components/shared/ErrorMessage'
import { Check, X } from 'lucide-react'

function PasswordRule({ ok, label }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${ok ? 'text-success' : 'text-muted'}`}>
      {ok ? <Check size={11} /> : <X size={11} />}
      {label}
    </li>
  )
}

function validatePassword(pw) {
  return {
    length:  pw.length >= 8,
    letter:  /[A-Za-z]/.test(pw),
    number:  /[0-9]/.test(pw),
  }
}

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ name: '', email: '', password: '', profession: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)

  const rules = validatePassword(form.password)
  const pwValid = Object.values(rules).every(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pwValid) return
    setError('')
    setLoading(true)
    try {
      const { data } = await register(form)
      setAuth(data.user, data.accessToken)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'bg-surface border border-border text-text rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors'

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-text mb-8">{t('auth.register')}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className={inputCls}
          placeholder={t('auth.name')}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          className={inputCls}
          placeholder={t('auth.email')}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <div className="flex flex-col gap-1.5">
          <input
            type="password"
            className={`${inputCls} ${form.password && !pwValid ? 'border-error/50' : ''}`}
            placeholder={t('auth.password')}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onFocus={() => setPwFocused(true)}
            required
          />
          {(pwFocused || form.password) && (
            <ul className="flex flex-col gap-1 px-1">
              <PasswordRule ok={rules.length} label="Минимум 8 символов" />
              <PasswordRule ok={rules.letter} label="Хотя бы одна буква" />
              <PasswordRule ok={rules.number} label="Хотя бы одна цифра" />
            </ul>
          )}
        </div>
        <input
          className={inputCls}
          placeholder={`${t('auth.profession')} (необязательно)`}
          value={form.profession}
          onChange={(e) => setForm({ ...form, profession: e.target.value })}
        />
        <ErrorMessage message={error} />
        <button
          type="submit"
          disabled={loading || !pwValid}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? t('common.loading') : t('auth.register')}
        </button>
      </form>
      <p className="text-muted text-sm mt-4 text-center">
        <Link to="/login" className="text-accent hover:underline">{t('auth.login')}</Link>
      </p>
    </div>
  )
}
