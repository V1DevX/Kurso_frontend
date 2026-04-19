import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLessons, getCourseProgress } from '@/api/courses'
import { getQuestions, watchLesson, submitTest } from '@/api/lessons'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import { CheckCircle, Circle, Clock } from 'lucide-react'

const STATUS_STYLES = {
  gray:   { icon: Circle,       cls: 'text-muted' },
  yellow: { icon: Clock,        cls: 'text-warning' },
  green:  { icon: CheckCircle,  cls: 'text-success' },
}

export default function LearnPage() {
  const { id: courseId } = useParams()
  const { t } = useTranslation()

  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState([])
  const [selected, setSelected] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [watching, setWatching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getLessons(courseId), getCourseProgress(courseId)])
      .then(([l, p]) => {
        setLessons(l.data)
        setProgress(p.data)
        if (l.data.length > 0) selectLesson(l.data[0], p.data)
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [courseId, t])

  const selectLesson = (lesson, prog = progress) => {
    setSelected(lesson)
    setResult(null)
    setAnswers([])
    getQuestions(lesson._id)
      .then(({ data }) => {
        setQuestions(data)
        setAnswers(new Array(data.length).fill(null))
      })
      .catch(() => setQuestions([]))
  }

  const getStatus = (lessonId) =>
    progress.find((p) => p.lessonId === lessonId)?.status || 'gray'

  const handleWatch = async () => {
    if (!selected) return
    setWatching(true)
    try {
      await watchLesson(selected._id)
      const { data } = await getCourseProgress(courseId)
      setProgress(data)
    } catch {
      setError(t('common.error'))
    } finally {
      setWatching(false)
    }
  }

  const handleSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    setError('')
    try {
      const { data } = await submitTest(selected._id, { answers })
      setResult(data)
      const { data: prog } = await getCourseProgress(courseId)
      setProgress(prog)
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <aside className="w-64 bg-surface border-r border-border overflow-y-auto flex flex-col gap-1 p-3 shrink-0">
        {lessons.map((lesson) => {
          const status = getStatus(lesson._id)
          const { icon: Icon, cls } = STATUS_STYLES[status] || STATUS_STYLES.gray
          return (
            <button
              key={lesson._id}
              onClick={() => selectLesson(lesson)}
              className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selected?._id === lesson._id
                  ? 'bg-primary/20 text-text'
                  : 'text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <Icon size={14} className={cls} />
              <span className="line-clamp-2">{lesson.title}</span>
            </button>
          )
        })}
      </aside>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {!selected ? (
          <p className="text-muted">{t('common.loading')}</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-text">{selected.title}</h1>

            {selected.videoUrl && (
              <a
                href={selected.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-sm"
              >
                ▶ Смотреть видео
              </a>
            )}

            {selected.content && (
              <div className="text-text whitespace-pre-wrap leading-relaxed">{selected.content}</div>
            )}

            <button
              onClick={handleWatch}
              disabled={watching}
              className="self-start border border-border text-muted hover:text-text hover:border-primary text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {watching ? t('common.loading') : t('lesson.watch')}
            </button>

            {questions.length > 0 && (
              <div className="flex flex-col gap-5 border-t border-border pt-6">
                <h2 className="text-lg font-semibold text-text">{t('lesson.questions')}</h2>
                {questions.map((q, qi) => (
                  <div key={q._id} className="flex flex-col gap-2">
                    <p className="text-text font-medium">{qi + 1}. {q.question}</p>
                    <div className="flex flex-col gap-1.5">
                      {q.options.map((opt, oi) => (
                        <label
                          key={oi}
                          className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border transition-colors ${
                            answers[qi] === oi
                              ? 'border-primary bg-primary/10 text-text'
                              : 'border-border text-muted hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q${qi}`}
                            className="hidden"
                            checked={answers[qi] === oi}
                            onChange={() => {
                              const next = [...answers]
                              next[qi] = oi
                              setAnswers(next)
                            }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <ErrorMessage message={error} />

                {result ? (
                  <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-1">
                    <p className="text-text font-semibold">
                      {result.correct}/{result.total} правильных — {result.score}%
                    </p>
                    {result.gamification?.xpEarned > 0 && (
                      <p className="text-success text-sm">+{result.gamification.xpEarned} XP</p>
                    )}
                    <p className={`text-sm ${result.status === 'green' ? 'text-success' : 'text-warning'}`}>
                      {result.status === 'green' ? '✓ Урок пройден' : '○ Попробуйте ещё раз'}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || answers.includes(null)}
                    className="self-start bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? t('common.loading') : t('lesson.submit')}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
