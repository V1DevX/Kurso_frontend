import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLessons } from '../../api/courses'
import {
  updateLesson, getQuestions, createQuestions, replaceQuestions,
} from '../../api/lessons'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ErrorMessage from '../../components/shared/ErrorMessage'
import { Eye, Code, Plus, Trash2, AlertTriangle, Check } from 'lucide-react'

// ── Unsaved-changes blocker dialog ──────────────────────────────────────────
function BlockerDialog({ blocker }) {
  if (blocker.state !== 'blocked') return null
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full flex flex-col gap-4">
        <div className="flex items-center gap-3 text-warning">
          <AlertTriangle size={20} />
          <h2 className="font-semibold text-text">Несохранённые изменения</h2>
        </div>
        <p className="text-muted text-sm">Вы уходите со страницы. Все несохранённые изменения будут потеряны.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => blocker.reset()}
            className="border border-border text-muted px-4 py-2 rounded-lg text-sm hover:text-text transition-colors"
          >
            Остаться
          </button>
          <button
            onClick={() => blocker.proceed()}
            className="bg-error hover:bg-error/80 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Уйти
          </button>
        </div>
      </div>
    </div>
  )
}

// ── HTML editor with preview ─────────────────────────────────────────────────
function HtmlEditor({ value, onChange }) {
  const [preview, setPreview] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-muted">Материал (HTML)</label>
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors border border-border px-2 py-1 rounded"
        >
          {preview ? <><Code size={12} /> Редактировать</> : <><Eye size={12} /> Предпросмотр</>}
        </button>
      </div>
      {preview ? (
        <div
          className="min-h-48 bg-surface border border-border rounded-lg px-4 py-3 text-text text-sm leading-relaxed prose prose-invert max-w-none overflow-auto"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted">Пусто</p>' }}
        />
      ) : (
        <textarea
          className="min-h-48 bg-surface border border-border text-text rounded-lg px-4 py-3 text-sm font-mono outline-none focus:border-primary transition-colors resize-y"
          placeholder="<p>Введите HTML-контент урока...</p>"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

// ── Single question row ───────────────────────────────────────────────────────
function QuestionRow({ q, index, onChange, onDelete }) {
  const { t } = useTranslation()
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <span className="text-muted text-sm mt-2.5 w-5 shrink-0">{index + 1}.</span>
        <input
          className="flex-1 bg-surface-2 border border-border text-text rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          placeholder={t('question.text')}
          value={q.question}
          onChange={(e) => onChange({ ...q, question: e.target.value })}
          required
        />
        <button type="button" onClick={onDelete} className="text-muted hover:text-error transition-colors mt-2">
          <Trash2 size={15} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 pl-7">
        {q.options.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
              q.correctAnswer === i
                ? 'border-success/60 bg-success/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name={`correct-${index}`}
              className="hidden"
              checked={q.correctAnswer === i}
              onChange={() => onChange({ ...q, correctAnswer: i })}
            />
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              q.correctAnswer === i ? 'border-success' : 'border-border'
            }`}>
              {q.correctAnswer === i && <span className="w-2 h-2 rounded-full bg-success" />}
            </span>
            <input
              className="flex-1 bg-transparent text-text text-sm outline-none placeholder:text-muted min-w-0"
              placeholder={`${t('question.option')} ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const opts = [...q.options]
                opts[i] = e.target.value
                onChange({ ...q, options: opts })
              }}
              required
            />
          </label>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LessonEditor() {
  const { courseId, lessonId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState(null)
  const [questions, setQuestions] = useState([])
  const [isDirty, setIsDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const blocker = useBlocker(isDirty)

  // Warn on browser refresh/close
  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  useEffect(() => {
    Promise.all([getLessons(courseId), getQuestions(lessonId)])
      .then(([ls, qs]) => {
        const found = ls.data.find((l) => l._id === lessonId)
        if (!found) { navigate(`/author/courses/${courseId}/edit`); return }
        setLesson(found)
        setQuestions(qs.data.map((q) => ({ ...q })))
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [courseId, lessonId])

  const updateField = (key, val) => {
    setLesson((l) => ({ ...l, [key]: val }))
    setIsDirty(true)
    setSaved(false)
  }

  const updateQuestion = (i, q) => {
    setQuestions((qs) => { const n = [...qs]; n[i] = q; return n })
    setIsDirty(true)
    setSaved(false)
  }

  const deleteQuestion = (i) => {
    setQuestions((qs) => qs.filter((_, idx) => idx !== i))
    setIsDirty(true)
    setSaved(false)
  }

  const addQuestion = () => {
    setQuestions((qs) => [...qs, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      order: qs.length,
    }])
    setIsDirty(true)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updateLesson(lessonId, {
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        difficulty: lesson.difficulty,
        passingThreshold: lesson.passingThreshold,
      })
      await replaceQuestions(lessonId, questions.map((q, i) => ({ ...q, order: i })))
      setIsDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError(t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!lesson) return <ErrorMessage message={error || 'Урок не найден'} />

  const inputCls = 'bg-surface border border-border text-text rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors'

  return (
    <>
      <BlockerDialog blocker={blocker} />

      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/author/courses/${courseId}/edit`)}
              className="text-muted hover:text-text transition-colors text-sm"
            >
              ← Назад к курсу
            </button>
            <span className="text-border">/</span>
            <h1 className="text-xl font-bold text-text">{lesson.title || 'Урок'}</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
              saved
                ? 'bg-success/20 text-success'
                : isDirty
                  ? 'bg-primary hover:bg-primary-hover text-white'
                  : 'bg-surface border border-border text-muted cursor-default'
            }`}
          >
            {saved ? <><Check size={14} /> Сохранено</> : saving ? t('common.loading') : t('common.save')}
          </button>
        </div>

        <ErrorMessage message={error} />

        {/* Basic fields */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">{t('lesson.title')}</label>
            <input
              className={inputCls}
              value={lesson.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">{t('lesson.videoUrl')}</label>
            <input
              className={inputCls}
              placeholder="https://youtube.com/..."
              value={lesson.videoUrl || ''}
              onChange={(e) => updateField('videoUrl', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">{t('course.difficulty')}</label>
              <select
                className={inputCls}
                value={lesson.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value)}
              >
                <option value="beginner">{t('course.beginner')}</option>
                <option value="intermediate">{t('course.intermediate')}</option>
                <option value="advanced">{t('course.advanced')}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">{t('lesson.passing')}</label>
              <input
                type="number"
                min={0}
                max={100}
                className={inputCls}
                value={lesson.passingThreshold ?? 70}
                onChange={(e) => updateField('passingThreshold', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <HtmlEditor value={lesson.content || ''} onChange={(v) => updateField('content', v)} />
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">
              {t('lesson.questions')}
              <span className="ml-2 text-muted text-sm font-normal">({questions.length})</span>
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-1.5 border border-border text-muted hover:text-text hover:border-primary text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} />
              {t('question.add')}
            </button>
          </div>

          {questions.length === 0 && (
            <p className="text-muted text-sm text-center py-8 border border-dashed border-border rounded-xl">
              Нет вопросов. Нажмите «+» чтобы добавить.
            </p>
          )}

          {questions.map((q, i) => (
            <QuestionRow
              key={i}
              index={i}
              q={q}
              onChange={(updated) => updateQuestion(i, updated)}
              onDelete={() => deleteQuestion(i)}
            />
          ))}
        </div>

        {/* Bottom save */}
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
        )}
      </div>
    </>
  )
}
