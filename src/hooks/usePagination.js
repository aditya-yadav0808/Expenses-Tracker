import { useEffect, useMemo, useState } from 'react';

export function usePagination(items, size = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / size));
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  const slice = useMemo(() => items.slice((page - 1) * size, page * size), [items, page, size]);
  return { page, setPage, pages, slice, total: items.length, size };
}
