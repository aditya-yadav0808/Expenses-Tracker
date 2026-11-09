/** Downloads an array of flat objects as a CSV file. Guards against spreadsheet formula injection. */
export function downloadCSV(filename, rows) {
  if (!rows.length) return false;
  const keys = Object.keys(rows[0]);
  const esc = (v) => {
    let s = String(v ?? '');
    if (typeof v === 'string' && /^[=+\-@]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  return true;
}
