import { useEffect, useState, type FormEvent } from 'react'
import styles from '../admin/admin-common.module.css'
import {
  ApiError,
  superadminCreateFAQ,
  superadminCreateLeadership,
  superadminDeleteFAQ,
  superadminDeleteLeadership,
  superadminListFAQ,
  superadminListLeadership,
  superadminUpdateFAQ,
  superadminUpdateLeadership,
} from '../../lib/api'
import { byOrder, moveItem } from '../../lib/ordering'
import type { FAQItem, LeadershipMember } from '../../lib/types'
import { usePageMeta } from '../../lib/usePageMeta'

type Tab = 'leadership' | 'faq'

function messageFor(requestError: unknown, fallback: string) {
  return requestError instanceof ApiError ? requestError.message : fallback
}

export default function SiteSettingsPage() {
  usePageMeta({ title: 'Site content', noindex: true })
  const [tab, setTab] = useState<Tab>('leadership')
  const [leaders, setLeaders] = useState<LeadershipMember[]>([])
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  // The leader/FAQ being edited in the form above the list; null = adding new.
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null)
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  // Load errors for each list are kept separately so one can't hide the other.
  const [loadErrors, setLoadErrors] = useState<{ leadership?: string; faq?: string }>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    return Promise.allSettled([superadminListLeadership(), superadminListFAQ()]).then(([leaderResult, faqResult]) => {
      if (leaderResult.status === 'fulfilled') setLeaders(byOrder(leaderResult.value))
      if (faqResult.status === 'fulfilled') setFaqs(byOrder(faqResult.value))
      setLoadErrors({
        leadership: leaderResult.status === 'rejected' ? messageFor(leaderResult.reason, 'Could not load leadership.') : undefined,
        faq: faqResult.status === 'rejected' ? messageFor(faqResult.reason, 'Could not load FAQ items.') : undefined,
      })
    })
  }

  useEffect(() => { void load() }, [])

  // Runs a save/list action, then reloads. Returns whether it succeeded.
  async function act(action: () => Promise<unknown>, fallback: string) {
    setBusy(true)
    setError('')
    try {
      await action()
      return true
    } catch (requestError) {
      setError(messageFor(requestError, fallback))
      return false
    } finally {
      await load()
      setBusy(false)
    }
  }

  function resetLeaderForm(member?: LeadershipMember) {
    setEditingLeaderId(member?.id ?? null)
    setName(member?.name ?? '')
    setTitle(member?.title ?? '')
    setBio(member?.bio ?? '')
    setPhotoUrl(member?.photo_url ?? '')
  }

  function resetFaqForm(item?: FAQItem) {
    setEditingFaqId(item?.id ?? null)
    setQuestion(item?.question ?? '')
    setAnswer(item?.answer ?? '')
  }

  async function saveLeader(event: FormEvent) {
    event.preventDefault()
    // null (not undefined) so that clearing the field removes an existing photo.
    const data = { name, title, bio, photo_url: photoUrl.trim() || null }
    const ok = await act(
      () => editingLeaderId
        ? superadminUpdateLeadership(editingLeaderId, data)
        : superadminCreateLeadership({ ...data, order_index: leaders.length }),
      editingLeaderId ? 'Could not update leadership member.' : 'Could not add leadership member.',
    )
    if (ok) resetLeaderForm()
  }

  async function saveFaq(event: FormEvent) {
    event.preventDefault()
    const ok = await act(
      () => editingFaqId
        ? superadminUpdateFAQ(editingFaqId, { question, answer })
        : superadminCreateFAQ({ question, answer, order_index: faqs.length }),
      editingFaqId ? 'Could not update FAQ item.' : 'Could not add FAQ item.',
    )
    if (ok) resetFaqForm()
  }

  function editLeader(member: LeadershipMember) {
    resetLeaderForm(member)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function editFaq(item: FAQItem) {
    resetFaqForm(item)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function removeLeader(member: LeadershipMember) {
    if (!window.confirm(`Delete ${member.name}?`)) return
    if (await act(() => superadminDeleteLeadership(member.id), 'Could not delete member.') && editingLeaderId === member.id) resetLeaderForm()
  }

  async function removeFaq(item: FAQItem) {
    if (!window.confirm('Delete this FAQ item?')) return
    if (await act(() => superadminDeleteFAQ(item.id), 'Could not delete FAQ item.') && editingFaqId === item.id) resetFaqForm()
  }

  const loadError = tab === 'leadership' ? loadErrors.leadership : loadErrors.faq

  return (
    <div>
      <div className={styles.pageHeader}><div><h1>Site content</h1><p className={styles.pageSubtitle}>Manage the leadership profiles and FAQ shown on the public homepage. Only active items are shown, in the order listed here.</p></div></div>
      <div className={styles.tabs}>
        <button type="button" className={[styles.tab, tab === 'leadership' ? styles.tabActive : ''].join(' ')} onClick={() => setTab('leadership')}>Leadership</button>
        <button type="button" className={[styles.tab, tab === 'faq' ? styles.tabActive : ''].join(' ')} onClick={() => setTab('faq')}>FAQ</button>
      </div>
      {loadError && <p className={styles.errorText} role="alert">{loadError}</p>}
      {error && <p className={styles.errorText} role="alert">{error}</p>}
      {tab === 'leadership' ? <>
        <section className={styles.panel} style={{ marginBottom: 24 }}>
          <h2>{editingLeaderId ? `Edit ${name || 'leadership member'}` : 'Add leadership member'}</h2>
          <form onSubmit={saveLeader}>
            <div className={styles.field}><label htmlFor="leader-name">Name</label><input id="leader-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={255} required /></div>
            <div className={styles.field}><label htmlFor="leader-title">Title</label><input id="leader-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required /></div>
            <div className={styles.field}><label htmlFor="leader-bio">Biography</label><textarea id="leader-bio" value={bio} onChange={(event) => setBio(event.target.value)} rows={4} required /></div>
            <div className={styles.field}>
              <label htmlFor="leader-photo">Photo URL (optional)</label>
              <input id="leader-photo" type="url" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} placeholder="https://…" />
              {photoUrl && <img src={photoUrl} alt="Photo preview" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 10, marginTop: 8, border: '1px solid var(--line)' }} />}
            </div>
            <div className={styles.modalActions} style={{ justifyContent: 'flex-start' }}>
              <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? 'Saving…' : editingLeaderId ? 'Save changes' : 'Add member'}</button>
              {editingLeaderId && <button type="button" className={styles.secondaryBtn} onClick={() => resetLeaderForm()}>Cancel</button>}
            </div>
          </form>
        </section>
        {leaders.map((member, index) => <article key={member.id} className={styles.panel} style={{ marginBottom: 12, opacity: member.is_active ? 1 : 0.6 }}>
          <h2>
            {member.name} · {member.title}
            {!member.is_active && <span className={[styles.badge, styles.badgeGray].join(' ')} style={{ marginLeft: 8 }}>Inactive</span>}
          </h2>
          <p>{member.bio}</p>
          <div className={styles.listActions}>
            <button type="button" className={styles.iconBtn} disabled={busy || index === 0} aria-label={`Move ${member.name} up`}
              onClick={() => void act(() => moveItem(leaders, index, -1, (id, order_index) => superadminUpdateLeadership(id, { order_index })), 'Could not reorder.')}>↑</button>
            <button type="button" className={styles.iconBtn} disabled={busy || index === leaders.length - 1} aria-label={`Move ${member.name} down`}
              onClick={() => void act(() => moveItem(leaders, index, 1, (id, order_index) => superadminUpdateLeadership(id, { order_index })), 'Could not reorder.')}>↓</button>
            <button type="button" className={styles.iconBtn} onClick={() => editLeader(member)}>Edit</button>
            <button type="button" className={styles.iconBtn} disabled={busy}
              onClick={() => void act(() => superadminUpdateLeadership(member.id, { is_active: !member.is_active }), 'Could not update member.')}>{member.is_active ? 'Deactivate' : 'Activate'}</button>
            <button type="button" className={styles.iconBtn} disabled={busy} onClick={() => void removeLeader(member)}>Delete</button>
          </div>
        </article>)}
        {leaders.length === 0 && !loadErrors.leadership && <p className={styles.pageSubtitle}>No leadership members yet. The Leadership section stays hidden on the homepage until one is active.</p>}
      </> : <>
        <section className={styles.panel} style={{ marginBottom: 24 }}>
          <h2>{editingFaqId ? 'Edit FAQ item' : 'Add FAQ item'}</h2>
          <form onSubmit={saveFaq}>
            <div className={styles.field}><label htmlFor="faq-question">Question</label><input id="faq-question" value={question} onChange={(event) => setQuestion(event.target.value)} required /></div>
            <div className={styles.field}><label htmlFor="faq-answer">Answer</label><textarea id="faq-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} rows={4} required /></div>
            <div className={styles.modalActions} style={{ justifyContent: 'flex-start' }}>
              <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? 'Saving…' : editingFaqId ? 'Save changes' : 'Add FAQ item'}</button>
              {editingFaqId && <button type="button" className={styles.secondaryBtn} onClick={() => resetFaqForm()}>Cancel</button>}
            </div>
          </form>
        </section>
        {faqs.map((item, index) => <article key={item.id} className={styles.panel} style={{ marginBottom: 12, opacity: item.is_active ? 1 : 0.6 }}>
          <h2>
            {item.question}
            {!item.is_active && <span className={[styles.badge, styles.badgeGray].join(' ')} style={{ marginLeft: 8 }}>Inactive</span>}
          </h2>
          <p>{item.answer}</p>
          <div className={styles.listActions}>
            <button type="button" className={styles.iconBtn} disabled={busy || index === 0} aria-label="Move up"
              onClick={() => void act(() => moveItem(faqs, index, -1, (id, order_index) => superadminUpdateFAQ(id, { order_index })), 'Could not reorder.')}>↑</button>
            <button type="button" className={styles.iconBtn} disabled={busy || index === faqs.length - 1} aria-label="Move down"
              onClick={() => void act(() => moveItem(faqs, index, 1, (id, order_index) => superadminUpdateFAQ(id, { order_index })), 'Could not reorder.')}>↓</button>
            <button type="button" className={styles.iconBtn} onClick={() => editFaq(item)}>Edit</button>
            <button type="button" className={styles.iconBtn} disabled={busy}
              onClick={() => void act(() => superadminUpdateFAQ(item.id, { is_active: !item.is_active }), 'Could not update FAQ item.')}>{item.is_active ? 'Deactivate' : 'Activate'}</button>
            <button type="button" className={styles.iconBtn} disabled={busy} onClick={() => void removeFaq(item)}>Delete</button>
          </div>
        </article>)}
        {faqs.length === 0 && !loadErrors.faq && <p className={styles.pageSubtitle}>No FAQ items yet. The homepage shows the built-in FAQ until one is active.</p>}
      </>}
    </div>
  )
}
