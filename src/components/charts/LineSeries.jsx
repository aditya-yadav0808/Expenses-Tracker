import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFormat } from '../../hooks/useFormat';

export default function LineSeries({ data, series, money = true, height = 280 }) {
  const { fmt, fmtCompact } = useFormat();
  return (
    <div style={{ height }} role="img" aria-label="Line chart">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={56} tickFormatter={money ? fmtCompact : undefined} />
          <Tooltip formatter={(v) => (money ? fmt(v) : v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px #0002' }} />
          <Legend iconType="circle" />
          {series.map((s) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
