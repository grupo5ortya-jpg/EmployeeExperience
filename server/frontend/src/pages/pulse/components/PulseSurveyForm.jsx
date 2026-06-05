import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { X, CheckCircle2, MessageSquare } from 'lucide-react'
import { submitPulseResponse, completePulseAssignment } from '../../../services/pulseService'

/* ── Rating input (closed questions) ─────────────────────────── */
function QuestionRatingInput({ question, value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-slate-700 leading-snug">{question.text}</p>
      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => {
          const selected = value === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex-1 min-w-[72px] flex flex-col items-center gap-1 px-2 py-2.5
                          rounded-xl border text-xs font-medium transition-all cursor-pointer
                          ${selected
                            ? 'border-brand bg-brand text-white shadow-sm'
                            : 'border-brand-light bg-white text-slate-600 hover:border-brand hover:bg-brand-pale/40'
                          }`}
            >
              <span className={`text-base font-bold ${selected ? 'text-white' : 'text-brand'}`}>
                {opt.value}
              </span>
              <span className="text-center leading-tight">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Open comment input ───────────────────────────────────────── */
function OpenCommentInput({ question, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <MessageSquare size={14} className="text-brand shrink-0" />
        <p className="text-sm font-medium text-slate-700 leading-snug">{question.text}</p>
        <span className="text-xs text-slate-400 shrink-0">(opcional)</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Escribí tu respuesta aquí..."
        className="w-full rounded-xl border border-brand-light px-3.5 py-2.5 text-sm text-slate-700
                   placeholder:text-slate-400 outline-none bg-white resize-none
                   focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors"
      />
    </div>
  )
}

/* ── Main form modal ──────────────────────────────────────────── */
export default function PulseSurveyForm({ assignment, onClose, onCompleted }) {
  const { survey, surveyId, employeeId, assignedBy } = assignment
  const queryClient = useQueryClient()

  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const closedQuestions = survey.questions.filter((q) => q.type === 'Cerrada')
  const openQuestion    = survey.questions.find((q) => q.type === 'Abierta') ?? null

  const allClosedAnswered = closedQuestions.every((q) => answers[q.id]?.optionId)

  const setOption  = (questionId, optionId) =>
    setAnswers((prev) => ({ ...prev, [questionId]: { optionId } }))

  const setComment = (text) =>
    setAnswers((prev) => ({
      ...prev,
      ...(openQuestion ? { [openQuestion.id]: { text } } : {}),
    }))

  const handleSubmit = async () => {
    if (!allClosedAnswered) {
      setError('Por favor respondé todas las preguntas antes de continuar.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Submit one response per answered question
      const submissions = closedQuestions.map((q) => {
        const { optionId } = answers[q.id]
        const option = q.options.find((o) => o.id === optionId)
        return submitPulseResponse({
          surveyAssignmentId: surveyId,
          questionId:         q.id,
          questionOptionId:   optionId,
          numericValue:       option?.value ?? null,
          answerText:         null,
        })
      })

      // Open question (optional)
      const commentText = openQuestion ? (answers[openQuestion.id]?.text ?? '').trim() : ''
      if (openQuestion && commentText) {
        submissions.push(
          submitPulseResponse({
            surveyAssignmentId: surveyId,
            questionId:         openQuestion.id,
            answerText:         commentText,
            questionOptionId:   null,
            numericValue:       null,
          })
        )
      }

      await Promise.all(submissions)

      // Mark assignment as COMPLETED
      await completePulseAssignment({ surveyId, employeeId, assignedBy })

      // Invalidate so the card disappears from the list
      await queryClient.invalidateQueries({ queryKey: ['pending-pulse-surveys', employeeId] })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alerts-unread-count'] })

      setDone(true)
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error al enviar las respuestas. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy/40 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-xl">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-brand-light">
          <div>
            <p className="text-xs text-brand font-semibold uppercase tracking-wider">
              Pulso {survey.subType} días
            </p>
            <h2 className="text-base font-bold text-slate-800 mt-0.5">{survey.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success state */}
        {done ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">¡Encuesta completada!</h3>
              <p className="text-sm text-slate-500 mt-1">Gracias por tu respuesta. Tu feedback es muy valioso.</p>
            </div>
            <button
              type="button"
              onClick={onCompleted}
              className="mt-2 bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                         px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-6">

            {/* Closed questions */}
            {closedQuestions.map((q, i) => (
              <div key={q.id}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Pregunta {i + 1} de {survey.questions.length}
                </p>
                <QuestionRatingInput
                  question={q}
                  value={answers[q.id]?.optionId ?? null}
                  onChange={(optionId) => setOption(q.id, optionId)}
                />
                {i < closedQuestions.length - 1 && (
                  <div className="border-t border-brand-light mt-6" />
                )}
              </div>
            ))}

            {/* Open question */}
            {openQuestion && (
              <>
                <div className="border-t border-brand-light" />
                <OpenCommentInput
                  question={openQuestion}
                  value={answers[openQuestion.id]?.text ?? ''}
                  onChange={setComment}
                />
              </>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-brand-light">
              <p className="text-xs text-slate-400">
                {closedQuestions.filter((q) => answers[q.id]?.optionId).length} / {closedQuestions.length} respondidas
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !allClosedAnswered}
                className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold
                           px-6 py-2.5 rounded-lg transition-colors cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar respuestas'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
