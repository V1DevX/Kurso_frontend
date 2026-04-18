import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCourse, updateCourse, getLessons } from '../../api/courses'
import {
  createLesson, deleteLesson, updateLesson,
  getQuestions, createQuestions,
} from '../../api/lessons'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const inputCls = 'bg-surface border border-border text-text rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-colors text-sm'

function LessonForm({ courseId, onCreated }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ title: '', content: '', videoUrl: '', difficulty: 'beginner', passingThreshold: 70 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await createLesson(courseId, { ...form, order: Date.now() })
      onCreated(data)
      setForm({ title: '', content: '', videoUrl: '', difficulty: 'beginner', passingThreshold: 70 })
    } catch { setError(t('common.error')) }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-surface-2 rounded-xl p-4 mt-3">
      <input className={inputCls} placeholder={t('lesson.title')} value={form.title} onChange={(e) => set('title', e.target.value)} required />
      <textarea className={`${inputCls} min-h-20 resize-y`} placeholder={t('lesson.content')} value={form.content} onChange={(e) => set('content', e.target.value)} />
      <input className={inputCls} placeholder={t('lesson.videoUrl')} value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <select className={inputCls} value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
          <option value="beginner">{t('course.beginner')}</option>
          <option value="intermediate">{t('course.intermediate')}</option>
          <option value="advanced">{t('course.advanced')}</option>
        </select>
        <input type="number" min={0} max={100} className={inputCls} placeholder={t('lesson.passing')} value={form.passingThreshold} onChange={(e) => set('passingThreshold', Number(e.target.value))} />
      </div>
      <ErrorMessage message={error} />
      <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors">
        {loading ? t('common.loading') : t('lesson.add')}
      </button>
    </form>
  )
}

function QuestionManager({ lessonId }) {
  const { t } = useTranslation()
  const [questions, setQuestions] = useState([])
  const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getQuestions(lessonId).then(({ data }) => setQuestions(data)).finally(() => setLoading(false))
  }, [lessonId])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await createQuestions(lessonId, [{ ...form, order: questions.length }])
      setQuestions((q) => [...q, ...data])
      setForm({ question: '', options: ['', '', '', ''], correctAnswer: 0 })
    } finally { setSaving(false) }
  }

  if (loading) return <div className="text-muted text-xs p-2">{t('common.loading')}</div>

  return (
    <div className="flex flex-col gap-3 mt-2">
      {questions.map((q, i) => (
        <div key={q._id} className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-muted">
          <span className="text-text">{i + 1}. {q.question}</span>
          <span className="ml-2 text-success text-xs">✓ {q.options[q.correctAnswer]}</span>
        </div>
      ))}
      <form onSubmit={handleAdd} className="flex flex-col gap-2 bg-surface-2 rounded-xl p-3">
        <input className={inputCls} placeholder={t('question.text')} value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} required />
        {form.options.map((opt, i) => (
          <input
            key={i}
            className={inputCls}
            placeholder={`${t('question.option')} ${i + 1}`}
            value={opt}
            onChange={(e) => {
              const opts = [...form.options]; opts[i] = e.target.value
              setForm((f) => ({ ...f, options: opts }))
            }}
            required
          />
        ))}
        <select className={inputCls} value={form.correctAnswer} onChange={(e) => setForm((f) => ({ ...f, correctAnswer: Number(e.target.value) }))}>
          {form.options.map((_, i) => <option key={i} value={i}>{t('question.option')} {i + 1}</option>)}
        </select>
        <button type="submit" disabled={saving} className="bg-surface border border-border hover:border-primary text-text py-1.5 rounded-lg text-xs transition-colors">
          {saving ? t('common.loading') : t('question.add')}
        </button>
      </form>
    </div>
  )
}

function LessonRow({ lesson, courseId, onDelete }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-text text-sm">{lesson.title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/author/courses/${courseId}/lessons/${lesson._id}/edit`)}
            className="text-muted hover:text-text transition-colors text-xs px-2 py-1 border border-border rounded hover:border-primary"
          >
            {t('common.edit')}
          </button>
          <button onClick={() => setOpen((o) => !o)} className="text-muted hover:text-text transition-colors p-1">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onDelete(lesson._id)} className="text-muted hover:text-error transition-colors p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted mb-2">{t('lesson.questions')}</p>
          <QuestionManager lessonId={lesson._id} />
        </div>
      )}
    </div>
  )
}

export default function CourseEdit() {
  const { id } = useParams()
  const { t } = useTranslation()

  const [form, setForm] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getCourse(id), getLessons(id)])
      .then(([c, l]) => {
        const { title, description, category, difficulty, price, language, visibility } = c.data
        setForm({ title, description, category, difficulty, price, language: language || [], visibility })
        setLessons(l.data)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try { await updateCourse(id, form) }
    catch { setError(t('common.error')) }
    finally { setSaving(false) }
  }

  const handleDeleteLesson = async (lessonId) => {
    try {
      await deleteLesson(lessonId)
      setLessons((ls) => ls.filter((l) => l._id !== lessonId))
    } catch { setError(t('common.error')) }
  }

  if (loading || !form) return <LoadingSpinner />

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-text">{t('common.edit')}</h1>
      <ErrorMessage message={error} />

      <form onSubmit={handleSave} className="flex flex-col gap-4 bg-surface border border-border rounded-xl p-6">
        <input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={t('course.title')} required />
        <textarea className={`${inputCls} min-h-24 resize-y`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder={t('course.description')} required />
        <input className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder={t('course.category')} required />
        <div className="grid grid-cols-2 gap-4">
          <select className={inputCls} value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}>
            <option value="beginner">{t('course.beginner')}</option>
            <option value="intermediate">{t('course.intermediate')}</option>
            <option value="advanced">{t('course.advanced')}</option>
          </select>
          <select className={inputCls} value={form.visibility} onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))}>
            <option value="public">{t('course.public')}</option>
            <option value="link">{t('course.link')}</option>
            <option value="approval">{t('course.approval')}</option>
          </select>
        </div>
        <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors">
          {saving ? t('common.loading') : t('common.save')}
        </button>
      </form>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text">{t('nav.courses')} ({lessons.length})</h2>
          <button
            onClick={() => setShowAddLesson((v) => !v)}
            className="flex items-center gap-1.5 border border-border text-muted hover:text-text hover:border-primary text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} />
            {t('lesson.add')}
          </button>
        </div>
        {showAddLesson && <LessonForm courseId={id} onCreated={(l) => { setLessons((ls) => [...ls, l]); setShowAddLesson(false) }} />}
        <div className="flex flex-col gap-2 mt-3">
          {lessons.map((lesson) => (
            <LessonRow key={lesson._id} lesson={lesson} courseId={id} onDelete={handleDeleteLesson} />
          ))}
        </div>
      </div>
    </div>
  )
}
