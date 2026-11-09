import { Outlet } from 'react-router-dom';
import { Wallet, ShieldCheck, LineChart, PiggyBank } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-slate-900 p-10 text-slate-300 lg:flex">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white"><Wallet className="h-5 w-5" /></span><span className="text-xl font-extrabold text-white">MoneyWise</span></div>
        <div>
          <h2 className="max-w-sm text-4xl font-extrabold leading-tight text-white">Know where every rupee goes.</h2>
          <ul className="mt-8 space-y-4 text-sm">
            {[[LineChart, 'Income and expense trends calculated from your own records'], [PiggyBank, 'Budgets that warn you at 80% and flag overspending'], [ShieldCheck, 'Your accounts and records are saved permanently']].map(([I, t]) => <li key={t} className="flex items-center gap-3"><I className="h-5 w-5 text-brand-400" />{t}</li>)}
          </ul>
        </div>
        <p className="text-xs text-slate-500">MoneyWise</p>
      </aside>
      <main className="flex items-center justify-center p-6"><div className="w-full max-w-md"><Outlet /></div></main>
    </div>
  );
}
