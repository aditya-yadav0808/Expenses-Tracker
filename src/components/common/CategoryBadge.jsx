import { CategoryIcon } from '../../utils/icons';
export default function CategoryBadge({ cat }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}><CategoryIcon name={cat.icon} className="h-4 w-4" /></span>
      <span className="text-sm">{cat.name}</span>
    </span>
  );
}
