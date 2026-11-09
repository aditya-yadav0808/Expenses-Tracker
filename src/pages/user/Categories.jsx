import { useState } from 'react';
import { Lock, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import PageHeader from '../../components/common/PageHeader';
import Segmented from '../../components/common/Segmented';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryForm from '../../components/forms/CategoryForm';
import CategoryBadge from '../../components/common/CategoryBadge';
import Field from '../../components/common/Field';

export default function Categories() {
  const { categories, transactions, recurring } = useUserData();
  const { act } = useAppData(); const { user } = useAuth(); const toast = useToast();
  const [type, setType] = useState('all');
  const [edit, setEdit] = useState(null); const [del, setDel] = useState(null); const [target, setTarget] = useState('');
  const usage = (id) => transactions.filter((t) => t.categoryId === id).length + recurring.filter((r) => r.categoryId === id).length;
  const list = categories.filter((c) => type === 'all' || c.type === type);
  const save = (v) => {
    if (edit.id) { act.updateCategory(edit.id, v); toast.success('Category updated'); }
    else { act.addCategory({ ...v, global: false, active: true, userId: user.id }); toast.success('Category added'); }
    setEdit(null);
  };
  const remove = () => {
    const n = usage(del.id);
    if (n && !target) return;
    act.deleteCategory(del.id, n ? target : null); toast.success(n ? `Category deleted; ${n} record(s) moved` : 'Category deleted'); setDel(null); setTarget('');
  };
  const alternatives = del ? categories.filter((c) => c.id !== del.id && c.type === del.type) : [];
  return (
    <>
      <PageHeader title="Categories" subtitle="Default categories are managed by admins. Add your own for anything else."><button className="btn-primary" onClick={() => setEdit({})}><Plus className="h-4 w-4" />Add category</button></PageHeader>
      <div className="mb-4"><Segmented label="Filter by type" value={type} onChange={setType} options={[{ value: 'all', label: 'All' }, { value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} /></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} className="card flex items-center justify-between gap-2 !p-4">
            <div><CategoryBadge cat={c} /><p className="mt-1 flex items-center gap-2 pl-9 text-xs text-slate-500"><span className={c.type === 'income' ? 'badge-green' : 'badge-red'}>{c.type}</span>{usage(c.id)} record(s)</p></div>
            {c.global ? <span className="badge-slate" title="Managed by administrators"><Lock className="h-3 w-3" />Default</span> : (
              <div className="flex gap-1"><button className="icon-btn" aria-label={`Edit ${c.name}`} onClick={() => setEdit(c)}><Pencil className="h-4 w-4" /></button><button className="icon-btn hover:!text-rose-600" aria-label={`Delete ${c.name}`} onClick={() => { setDel(c); setTarget(''); }}><Trash2 className="h-4 w-4" /></button></div>)}
          </div>))}
        {list.length === 0 && <p className="text-sm text-slate-500"><Tags className="mr-1 inline h-4 w-4" />No categories of this type.</p>}
      </div>
      <Modal open={!!edit} title={edit?.id ? 'Edit category' : 'Add category'} onClose={() => setEdit(null)}>
        {edit && <CategoryForm initial={edit.id ? edit : undefined} lockType={!!edit.id && usage(edit.id) > 0} existing={categories} onSubmit={save} onCancel={() => setEdit(null)} />}
      </Modal>
      {del && usage(del.id) > 0 ? (
        <Modal open title={`Delete “${del.name}”`} onClose={() => setDel(null)}>
          <p className="text-sm text-slate-600 dark:text-slate-300">{usage(del.id)} transaction/recurring record(s) use this category. Choose where to move them. Budgets for this category will be removed.</p>
          <div className="mt-4"><Field label="Move records to"><select className="input" value={target} onChange={(e) => setTarget(e.target.value)}><option value="">Select category</option>{alternatives.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field></div>
          <div className="mt-5 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setDel(null)}>Cancel</button><button className="btn-danger" disabled={!target} onClick={remove}>Move records and delete</button></div>
        </Modal>
      ) : <ConfirmDialog open={!!del} message={`Delete the category “${del?.name}”? No records use it.`} onCancel={() => setDel(null)} onConfirm={remove} />}
    </>
  );
}
