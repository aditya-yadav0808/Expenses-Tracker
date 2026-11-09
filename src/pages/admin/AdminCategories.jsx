import { useState } from 'react';
import { Pencil, Plus, Power } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import PageHeader from '../../components/common/PageHeader';
import Segmented from '../../components/common/Segmented';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CategoryForm from '../../components/forms/CategoryForm';
import CategoryBadge from '../../components/common/CategoryBadge';

export default function AdminCategories() {
  const { data, act } = useAppData(); const { user } = useAuth(); const toast = useToast();
  const [type, setType] = useState('all'); const [edit, setEdit] = useState(null); const [toggle, setToggle] = useState(null);
  const globals = data.categories.filter((c) => c.global);
  const list = globals.filter((c) => type === 'all' || c.type === type);
  const uses = (id) => data.transactions.filter((t) => t.categoryId === id).length;
  const save = (v) => {
    if (edit.id) { act.updateCategory(edit.id, v); act.audit(user, 'GLOBAL_CATEGORY_UPDATED', edit.id, v.name); toast.success('Category updated'); }
    else { const n = act.addCategory({ ...v, global: true, active: true, userId: null }); act.audit(user, 'GLOBAL_CATEGORY_CREATED', n.id, v.name); toast.success('Category created'); }
    setEdit(null);
  };
  const flip = () => { const c = toggle; act.updateCategory(c.id, { active: !c.active }); act.audit(user, c.active ? 'GLOBAL_CATEGORY_DEACTIVATED' : 'GLOBAL_CATEGORY_ACTIVATED', c.id, c.name); toast.success(`${c.name} ${c.active ? 'deactivated' : 'activated'}`); setToggle(null); };
  return (
    <>
      <PageHeader title="Global categories" subtitle="Defaults available to every user. Disabling a category hides it from new entries but keeps history intact."><button className="btn-primary" onClick={() => setEdit({})}><Plus className="h-4 w-4" />New category</button></PageHeader>
      <div className="mb-4"><Segmented label="Filter by type" value={type} onChange={setType} options={[{ value: 'all', label: 'All' }, { value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} /></div>
      <div className="card overflow-hidden !p-0"><div className="overflow-x-auto"><table className="w-full min-w-[560px]">
        <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="th" scope="col">Category</th><th className="th" scope="col">Type</th><th className="th" scope="col">Used by</th><th className="th" scope="col">Status</th><th className="th text-right" scope="col">Actions</th></tr></thead>
        <tbody>{list.map((c) => <tr key={c.id} className="tr"><td className="td"><CategoryBadge cat={c} /></td><td className="td"><span className={c.type === 'income' ? 'badge-green' : 'badge-red'}>{c.type}</span></td><td className="td">{uses(c.id)} record(s)</td><td className="td"><span className={c.active ? 'badge-green' : 'badge-slate'}>{c.active ? 'Active' : 'Disabled'}</span></td>
          <td className="td"><div className="flex justify-end gap-1"><button className="icon-btn" aria-label={`Edit ${c.name}`} onClick={() => setEdit(c)}><Pencil className="h-4 w-4" /></button><button className="icon-btn" aria-label={`${c.active ? 'Deactivate' : 'Activate'} ${c.name}`} onClick={() => setToggle(c)}><Power className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div></div>
      <Modal open={!!edit} title={edit?.id ? 'Edit global category' : 'New global category'} onClose={() => setEdit(null)}>
        {edit && <CategoryForm initial={edit.id ? edit : undefined} lockType={!!edit.id && uses(edit.id) > 0} existing={globals} onSubmit={save} onCancel={() => setEdit(null)} />}
      </Modal>
      <ConfirmDialog open={!!toggle} danger={!!toggle?.active} confirmText={toggle?.active ? 'Deactivate' : 'Activate'} title={toggle?.active ? 'Deactivate category?' : 'Activate category?'}
        message={toggle?.active ? `“${toggle.name}” will no longer be offered for new transactions. ${uses(toggle.id)} existing record(s) keep their category.` : `“${toggle?.name}” will be available to all users again.`} onCancel={() => setToggle(null)} onConfirm={flip} />
    </>
  );
}
