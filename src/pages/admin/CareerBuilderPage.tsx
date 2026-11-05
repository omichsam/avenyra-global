import { useEffect, useState, type FormEvent } from 'react';
import styles from './admin-common.module.css';
import {
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminListQuestions,
  adminCreateQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion,
  ApiError,
} from '../../lib/api';
import { byOrder, moveItem } from '../../lib/ordering';
import type { Category, Question } from '../../lib/types';
import { usePageMeta } from '../../lib/usePageMeta';

type Tab = 'categories' | 'questions';

export default function CareerBuilderPage() {
  usePageMeta({ title: 'Career builder', noindex: true });
  const [tab, setTab] = useState<Tab>('categories');

  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newQuestionPrompt, setNewQuestionPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    adminListCategories().then((items) => setCategories(byOrder(items))).catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load.'));
    adminListQuestions().then((items) => setQuestions(byOrder(items))).catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load.'));
  }

  useEffect(load, []);

  // Runs a list action (rename/move/toggle/delete) and reloads, surfacing
  // failures instead of leaving the click silently doing nothing. Returns
  // whether it succeeded so callers can e.g. leave edit mode.
  async function act(action: () => Promise<unknown>, fallback: string) {
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : fallback);
      return false;
    } finally {
      load();
    }
  }

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await adminCreateCategory(newCategoryName.trim(), categories.length);
      setNewCategoryName('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add career field.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddQuestion(e: FormEvent) {
    e.preventDefault();
    if (!newQuestionPrompt.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await adminCreateQuestion(newQuestionPrompt.trim(), questions.length);
      setNewQuestionPrompt('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add question.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Career fields &amp; questions</h1>
          <p className={styles.pageSubtitle}>Control what applicants see in the application wizard, and in what order.</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button type="button" className={[styles.tab, tab === 'categories' ? styles.tabActive : ''].join(' ')} onClick={() => setTab('categories')}>
          Career fields
        </button>
        <button type="button" className={[styles.tab, tab === 'questions' ? styles.tabActive : ''].join(' ')} onClick={() => setTab('questions')}>
          Screening questions
        </button>
      </div>

      {error && <p className={styles.errorText} role="alert">{error}</p>}

      {tab === 'categories' && (
        <div className={styles.panel}>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              placeholder="e.g. Engineering"
              aria-label="New career field"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              maxLength={255}
              style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 9, padding: '10px 13px', fontSize: 14 }}
            />
            <button type="submit" className={styles.primaryBtn} disabled={saving}>Add</button>
          </form>

          <OrderedList
            items={categories}
            label={(c) => c.name}
            noun="career field"
            onRename={(c, name) => act(() => adminUpdateCategory(c.id, { name }), 'Could not rename career field.')}
            onMove={(index, delta) => act(() => moveItem(categories, index, delta, (id, order_index) => adminUpdateCategory(id, { order_index })), 'Could not reorder career fields.')}
            onToggle={(c) => act(() => adminUpdateCategory(c.id, { is_active: !c.is_active }), 'Could not update career field.')}
            onDelete={(c) => {
              if (!confirm(`Delete "${c.name}"? Applicants who selected it will keep their answer, but it won't be offered to new applicants.`)) return;
              void act(() => adminDeleteCategory(c.id), 'Could not delete career field.');
            }}
          />
          {categories.length === 0 && <p className={styles.pageSubtitle}>No career fields yet. Add one above.</p>}
        </div>
      )}

      {tab === 'questions' && (
        <div className={styles.panel}>
          <form onSubmit={handleAddQuestion} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              placeholder="e.g. Why do you want this role?"
              aria-label="New screening question"
              value={newQuestionPrompt}
              onChange={(e) => setNewQuestionPrompt(e.target.value)}
              style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 9, padding: '10px 13px', fontSize: 14 }}
            />
            <button type="submit" className={styles.primaryBtn} disabled={saving}>Add</button>
          </form>

          <OrderedList
            items={questions}
            label={(q) => q.prompt}
            noun="question"
            onRename={(q, prompt) => act(() => adminUpdateQuestion(q.id, { prompt }), 'Could not update question.')}
            onMove={(index, delta) => act(() => moveItem(questions, index, delta, (id, order_index) => adminUpdateQuestion(id, { order_index })), 'Could not reorder questions.')}
            onToggle={(q) => act(() => adminUpdateQuestion(q.id, { is_active: !q.is_active }), 'Could not update question.')}
            onDelete={(q) => {
              const message = q.is_active
                ? 'Delete this question? Every applicant’s answer to it will be permanently removed.\n\nTo stop asking it but keep existing answers, choose Cancel and use Deactivate instead.'
                : 'Delete this question? Every applicant’s answer to it will be permanently removed.';
              if (!confirm(message)) return;
              void act(() => adminDeleteQuestion(q.id), 'Could not delete question.');
            }}
          />
          {questions.length === 0 && <p className={styles.pageSubtitle}>No screening questions yet. Add one above.</p>}
        </div>
      )}
    </div>
  );
}

interface OrderedListProps<T extends { id: string; is_active: boolean }> {
  items: T[];
  label: (item: T) => string;
  noun: string;
  onRename: (item: T, text: string) => Promise<boolean>;
  onMove: (index: number, delta: -1 | 1) => Promise<boolean>;
  onToggle: (item: T) => Promise<boolean>;
  onDelete: (item: T) => void;
}

function OrderedList<T extends { id: string; is_active: boolean }>({ items, label, noun, onRename, onMove, onToggle, onDelete }: OrderedListProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<boolean>) {
    setBusy(true);
    const ok = await action();
    setBusy(false);
    return ok;
  }

  async function saveRename(e: FormEvent, item: T) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || text === label(item)) { setEditingId(null); return; }
    if (await run(() => onRename(item, text))) setEditingId(null);
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} className={styles.listRow}>
          {editingId === item.id ? (
            <form onSubmit={(e) => void saveRename(e, item)} className={styles.listEdit}>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={`Edit ${noun}`} autoFocus required />
              <button type="submit" className={styles.primaryBtn} disabled={busy}>Save</button>
              <button type="button" className={styles.secondaryBtn} onClick={() => setEditingId(null)}>Cancel</button>
            </form>
          ) : (
            <>
              <span className={styles.listLabel} style={{ opacity: item.is_active ? 1 : 0.5 }}>
                {label(item)}
                {!item.is_active && <span className={[styles.badge, styles.badgeGray].join(' ')} style={{ marginLeft: 8 }}>Inactive</span>}
              </span>
              <div className={styles.listActions}>
                <button type="button" className={styles.iconBtn} onClick={() => void run(() => onMove(index, -1))} disabled={busy || index === 0} aria-label={`Move "${label(item)}" up`}>↑</button>
                <button type="button" className={styles.iconBtn} onClick={() => void run(() => onMove(index, 1))} disabled={busy || index === items.length - 1} aria-label={`Move "${label(item)}" down`}>↓</button>
                <button type="button" className={styles.iconBtn} onClick={() => { setEditingId(item.id); setDraft(label(item)); }}>Edit</button>
                <button type="button" className={styles.iconBtn} onClick={() => void run(() => onToggle(item))} disabled={busy}>
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button type="button" className={styles.iconBtn} onClick={() => onDelete(item)} disabled={busy}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
