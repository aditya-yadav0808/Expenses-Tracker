import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFormat } from '../../hooks/useFormat';

export const INCOME_EXPENSE = [{ key: 'income', name: 'Income', color: '#16a34a' }, { key: 'expense', name: 'Expenses', color: '#e11d48' }];
export default function BarSeries({ data, series = INCOME_EXPENSE, money = true, height = 280 }) {
  const { fmt, fmtCompact } = useFormat();
  return (
    <div style={{ height }} role="img" aria-label="Bar chart">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={56} tickFormatter={money ? fmtCompact : undefined} />
          <Tooltip formatter={(v) => (money ? fmt(v) : v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px #0002' }} cursor={{ fill: '#94a3b822' }} />
          {series.length > 1 && <Legend iconType="circle" />}
          {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[6, 6, 0, 0]} maxBarSize={36} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
