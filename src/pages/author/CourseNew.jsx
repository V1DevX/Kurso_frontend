import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createCourse } from '@/api/courses'
import ErrorMessage from '@/components/shared/ErrorMessage'

const LANGUAGES = ['ru', 'ky', 'en']

export default function CourseNew() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    price: 0,
    language: ['ru'],
    visibility: 'public',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const toggleLang = (lang) => {
    set('language', form.language.includes(lang)
      ? form.language.filter((l) => l !== lang)
      : [...form.language, lang]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await createCourse(form)
      navigate(`/author/courses/${data._id}/edit`)
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'bg-surface border border-border text-text rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors'
  const labelCls = 'text-sm text-muted mb-1'

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-text mb-8">{t('author.createCourse')}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>{t('course.title')}</label>
          <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>{t('course.description')}</label>
          <textarea
            className={`${inputCls} min-h-24 resize-y`}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>{t('course.category')}</label>
          <input className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>{t('course.difficulty')}</label>
            <select className={inputCls} value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
              <option value="beginner">{t('course.beginner')}</option>
              <option value="intermediate">{t('course.intermediate')}</option>
              <option value="advanced">{t('course.advanced')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelCls}>{t('course.price')} (сом)</label>
            <input type="number" min={0} className={inputCls} value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>{t('course.language')}</label>
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  form.language.includes(lang)
                    ? 'border-primary bg-primary/20 text-text'
                    : 'border-border text-muted hover:border-primary/50'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelCls}>{t('course.visibility')}</label>
          <select className={inputCls} value={form.visibility} onChange={(e) => set('visibility', e.target.value)}>
            <option value="public">{t('course.public')}</option>
            <option value="link">{t('course.link')}</option>
            <option value="approval">{t('course.approval')}</option>
          </select>
        </div>

        <ErrorMessage message={error} />

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? t('common.loading') : t('author.createCourse')}
        </button>
      </form>
    </div>
  )
}
