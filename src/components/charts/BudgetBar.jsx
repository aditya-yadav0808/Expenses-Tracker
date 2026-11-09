import BarSeries from './BarSeries';
export default function BudgetBar({ data }) {
  return <BarSeries data={data} series={[{ key: 'limit', name: 'Budget', color: '#0e7490' }, { key: 'spent', name: 'Spent', color: '#f59e0b' }]} />;
}
