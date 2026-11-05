import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ApiError,
  getMyAnswers,
  getMyApplication,
  getMyUploads,
  listCategories,
  listQuestions,
  submitAnswers,
  submitMyApplication,
  updateMyApplication,
  UPLOAD_ACCEPT,
  uploadFile,
} from '../lib/api'
import type { Answer, Application, Category, Question, Upload } from '../lib/types'
import { LOCATION_LIST_ID, LOCATION_SUGGESTIONS, PHONE_PATTERN, PHONE_PLACEHOLDER } from '../lib/locations'
import { usePageMeta } from '../lib/usePageMeta'

const steps = ['Career field', 'Contact details', 'Resume', 'Screening questions', 'Review & submit']

export default function ApplicationPage() {
  usePageMeta({ title: 'Your application', noindex: true })
  const [searchParams, setSearchParams] = useSearchParams()
  const step = stepFrom(searchParams.get('step'))
  const [application, setApplication] = useState<Application | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [savedAnswers, setSavedAnswers] = useState<Answer[]>([])
  const [uploads, setUploads] = useState<Upload[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  // True when the current section has edits that haven't been saved yet.
  const [dirty, setDirty] = useState(false)
  const activeQuestions = questions.filter((question) => question.is_active)

  useEffect(() => {
    Promise.all([getMyApplication(), listCategories(), listQuestions(), getMyAnswers(), getMyUploads()])
      .then(([app, categoryList, questionList, answerList, uploadList]) => {
        setApplication(app)
        setCategories(categoryList)
        setQuestions(questionList)
        setAnswers(answerList)
        setSavedAnswers(answerList)
        setUploads(uploadList)
        setCategoryId(app.category_id ?? '')
        setPhone(app.phone ?? '')
        setLocation(app.location ?? '')
      })
      .catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : 'Could not load your application.'))
      .finally(() => setLoading(false))
  }, [])

  function goTo(next: number, saved = false) {
    if (dirty && !saved) {
      if (!window.confirm('You have unsaved changes in this section. Leave without saving?')) return
      setCategoryId(application?.category_id ?? '')
      setPhone(application?.phone ?? '')
      setLocation(application?.location ?? '')
      setAnswers(savedAnswers)
    }
    const bounded = Math.max(0, Math.min(steps.length - 1, next))
    setSearchParams({ step: String(bounded) })
    setDirty(false)
    setError('')
    setNotice('')
  }

  async function saveAndContinue(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (step === 0) {
        const updated = await updateMyApplication({ category_id: categoryId })
        setApplication(updated)
      } else if (step === 1) {
        const updated = await updateMyApplication({ phone, location })
        setApplication(updated)
      } else if (step === 3) {
        // The backend rejects blank responses, so only send questions the
        // applicant actually answered; the rest can be filled in later.
        const responses = activeQuestions
          .map((question) => ({
            question_id: question.id,
            response_text: answers.find((answer) => answer.question_id === question.id)?.response_text.trim() ?? '',
          }))
          .filter((response) => response.response_text)
        if (responses.length > 0) {
          await submitAnswers(responses)
          const latest = await getMyAnswers()
          setAnswers(latest)
          setSavedAnswers(latest)
        }
      }
      goTo(step + 1, true)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Could not save this section.')
    } finally {
      setBusy(false)
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const uploaded = await uploadFile(file)
      setUploads((current) => [...current, uploaded])
      setNotice(`${file.name} uploaded successfully.`)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Could not upload this file.')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  async function handleSubmit() {
    if (missing.length > 0 && !window.confirm(`Your application is missing: ${missing.join(', ')}.

Submit anyway? You won't be able to change it afterwards.`)) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const updated = await submitMyApplication()
      setApplication(updated)
      setNotice('Your application has been submitted.')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Could not submit your application.')
    } finally {
      setBusy(false)
    }
  }

  const answeredCount = activeQuestions.filter((question) =>
    savedAnswers.some((answer) => answer.question_id === question.id && answer.response_text.trim()),
  ).length
  // Shown on the review step. Only the career field is required by the
  // backend; the rest are warnings the applicant can choose to submit past.
  const missing = [
    !application?.phone && !application?.location && 'contact details',
    uploads.length === 0 && 'a resume or CV',
    answeredCount < activeQuestions.length && `${activeQuestions.length - answeredCount} unanswered screening question${activeQuestions.length - answeredCount === 1 ? '' : 's'}`,
  ].filter((item): item is string => !!item)

  if (loading) return <main className="workflow-page"><p>Loading your application…</p></main>
  if (error && !application && categories.length === 0 && questions.length === 0) {
    return <main className="workflow-page"><p className="form-error" role="alert">{error}</p><Link to="/dashboard">Back to dashboard</Link></main>
  }
  if (application?.submitted_at) {
    return <main className="workflow-page"><h1>Application submitted</h1><p>Your application has been received.</p><Link to="/dashboard">Back to dashboard</Link></main>
  }

  return (
    <main className="workflow-page">
      <header className="workflow-heading">
        <div><Link to="/dashboard">← Dashboard</Link><h1>Your application</h1><p>Complete each section, then review and submit.</p></div>
        <span>Step {step + 1} of {steps.length}</span>
      </header>
      <nav className="workflow-steps" aria-label="Application sections">
        {steps.map((label, index) => <button key={label} type="button" className={index === step ? 'active' : ''} onClick={() => goTo(index)}>{index + 1}. {label}</button>)}
      </nav>

      <form className="workflow-card" onSubmit={saveAndContinue}>
        {step === 0 && <>
          <h2>Which career field are you applying for?</h2>
          <label>Career field
            <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setDirty(true) }} required>
              <option value="">Select a field</option>
              {categories.filter((category) => category.is_active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          {categories.length === 0 && <p>No career fields are currently available.</p>}
        </>}
        {step === 1 && <>
          <h2>How can we reach you?</h2>
          <label>Phone number<input type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setDirty(true) }} autoComplete="tel" pattern={PHONE_PATTERN} maxLength={50} placeholder={PHONE_PLACEHOLDER} title="Enter a phone number, e.g. +254 712 345 678 or 0712 345 678" /></label>
          <label>Location<input value={location} onChange={(event) => { setLocation(event.target.value); setDirty(true) }} autoComplete="address-level2" list={LOCATION_LIST_ID} maxLength={255} placeholder="Start typing your town or city" /></label>
          <datalist id={LOCATION_LIST_ID}>{LOCATION_SUGGESTIONS.map((place) => <option key={place} value={place} />)}</datalist>
        </>}
        {step === 2 && <>
          <h2>Upload your resume or CV</h2>
          <p>Choose a document to upload. Uploads are stored securely through the application service.</p>
          <label>Resume or CV<input type="file" accept={UPLOAD_ACCEPT} onChange={handleUpload} disabled={busy} /></label>
          <p className="workflow-hint">PDF or Word document, up to 10 MB.</p>
          {uploads.map((file) => <p key={file.id} className="uploaded-file">{file.original_filename}</p>)}
        </>}
        {step === 3 && <>
          <h2>Screening questions</h2>
          {activeQuestions.length === 0 && <p>There are no screening questions right now.</p>}
          {activeQuestions.map((question) => (
            <label key={question.id}>{question.prompt}
              <textarea rows={4} value={answers.find((answer) => answer.question_id === question.id)?.response_text ?? ''}
                onChange={(event) => { setDirty(true); setAnswers((current) => {
                  const previous = current.filter((answer) => answer.question_id !== question.id)
                  return [...previous, { question_id: question.id, question_prompt: question.prompt, response_text: event.target.value, updated_at: '' }]
                }) }} />
            </label>
          ))}
        </>}
        {step === 4 && <>
          <h2>Review your application</h2>
          <dl className="review-list">
            <div><dt>Career field</dt><dd>{application?.category_name ?? 'Not selected'}</dd></div>
            <div><dt>Phone</dt><dd>{application?.phone || 'Not provided'}</dd></div>
            <div><dt>Location</dt><dd>{application?.location || 'Not provided'}</dd></div>
            <div><dt>Uploaded files</dt><dd>{uploads.length ? uploads.map((file) => file.original_filename).join(', ') : 'None'}</dd></div>
            <div><dt>Screening responses</dt><dd>{answeredCount} of {activeQuestions.length} answered</dd></div>
          </dl>
          {!application?.category_id ? (
            <div className="review-warning" role="alert">
              <strong>Choose a career field before submitting.</strong>
              <button type="button" className="text-button" onClick={() => goTo(0)}>Go to career field</button>
            </div>
          ) : missing.length > 0 && (
            <div className="review-warning" role="status">
              <strong>Before you submit</strong>
              <p>Your application is missing {missing.join(', ')}. Complete applications are reviewed first. You can't edit your application after submitting.</p>
              <div className="review-warning-links">
                {!application.phone && !application.location && <button type="button" className="text-button" onClick={() => goTo(1)}>Add contact details</button>}
                {uploads.length === 0 && <button type="button" className="text-button" onClick={() => goTo(2)}>Upload a CV</button>}
                {answeredCount < activeQuestions.length && <button type="button" className="text-button" onClick={() => goTo(3)}>Answer questions</button>}
              </div>
            </div>
          )}
          <button type="button" onClick={handleSubmit} disabled={busy || !application?.category_id}>{busy ? 'Submitting…' : 'Submit application'}</button>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-message" role="status">{notice}</p>}
        <div className="workflow-actions">
          {step > 0 && <button type="button" className="button-secondary" onClick={() => goTo(step - 1)} disabled={busy}>Back</button>}
          {step < steps.length - 1 && <button type="submit" disabled={busy}>{busy ? 'Saving…' : step === 2 ? 'Continue' : 'Save and continue'}</button>}
          {step === 2 && <span className="workflow-hint">Upload is optional for now; you can continue without a file.</span>}
        </div>
      </form>
    </main>
  )
}

function stepFrom(value: string | null) {
  const number = Number(value)
  return Number.isInteger(number) ? Math.max(0, Math.min(4, number)) : 0
}
