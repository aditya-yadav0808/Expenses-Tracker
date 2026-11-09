import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFormat } from '../../hooks/useFormat';

export default function CategoryPie({ data, height = 260 }) {
  const { fmt } = useFormat();
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div style={{ height, minWidth: 0 }} className="flex-1" role="img" aria-label="Pie chart of spending by category">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="none">
              {data.map((d) => <Cell key={d.id} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [`${fmt(v)} (${Math.round((v / total) * 100)}%)`, n]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px #0002' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-1.5 text-sm">
        {data.slice(0, 6).map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />{d.name}</span>
            <span className="text-slate-500">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
