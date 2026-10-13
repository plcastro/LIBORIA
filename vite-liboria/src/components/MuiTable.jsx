import { useMemo, useState } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';

export default function MuiTable({ columns = [], dataSource = [], rowKey = '_id', loading, pagination = {}, scroll, size, locale }) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState(null);
  const [filters, setFilters] = useState({});
  const rows = useMemo(() => {
    let result = dataSource.filter(row => columns.every(col => !filters[col.key || col.dataIndex]?.length || filters[col.key || col.dataIndex].includes(row[col.dataIndex])));
    if (sort) result = [...result].sort((a, b) => {
      const col = columns.find(item => (item.key || item.dataIndex) === sort.key);
      return (typeof col.sorter === 'function' ? col.sorter(a, b) : String(a[col.dataIndex] ?? '').localeCompare(String(b[col.dataIndex] ?? ''))) * sort.direction;
    });
    return result;
  }, [dataSource, columns, filters, sort]);
  const pageSize = pagination === false ? rows.length || 1 : pagination.pageSize || 10;
  const shown = pagination === false ? rows : rows.slice(page * pageSize, (page + 1) * pageSize);
  return <div style={{ position: 'relative' }}>
    {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: 16, left: '50%', zIndex: 1 }} />}
    <TableContainer sx={{ maxHeight: scroll?.y, overflowX: scroll?.x ? 'auto' : undefined }}>
      <Table size={size === 'small' ? 'small' : 'medium'} sx={{ minWidth: scroll?.x || undefined, '& .MuiTableCell-root': { fontFamily: 'inherit', borderColor: '#f0f0f0', fontSize: 14, padding: '12px 16px' }, '& .MuiTableCell-head': { background: '#fafafa', fontWeight: 600 } }}>
        <TableHead><TableRow>{columns.map((col, index) => <TableCell key={col.key || col.dataIndex || index} sx={{ width: col.width, display: col.responsive?.includes('sm') ? { xs: 'none', sm: 'table-cell' } : undefined }}>
          <span onClick={() => col.sorter && setSort(previous => ({ key: col.key || col.dataIndex, direction: previous?.key === (col.key || col.dataIndex) ? -previous.direction : 1 }))} style={{ cursor: col.sorter ? 'pointer' : undefined }}>{col.title}</span>
          {col.filters && <select aria-label={`Filter ${col.title}`} value={filters[col.key || col.dataIndex]?.[0] || ''} onChange={event => { setFilters(previous => ({ ...previous, [col.key || col.dataIndex]: event.target.value ? [event.target.value] : [] })); setPage(0); }}><option value="">All</option>{col.filters.map(option => <option key={option.value} value={option.value}>{option.text}</option>)}</select>}
        </TableCell>)}</TableRow></TableHead>
        <TableBody>{shown.length ? shown.map((row, index) => <TableRow key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey] ?? index} hover>{columns.map((col, cell) => <TableCell key={col.key || col.dataIndex || cell} sx={{ display: col.responsive?.includes('sm') ? { xs: 'none', sm: 'table-cell' } : undefined }}>{col.render ? col.render(row[col.dataIndex], row, index) : row[col.dataIndex]}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} align="center">{locale?.emptyText || 'No data'}</TableCell></TableRow>}</TableBody>
      </Table>
    </TableContainer>
    {pagination !== false && <TablePagination component="div" count={rows.length} page={Math.min(page, Math.max(0, Math.ceil(rows.length / pageSize) - 1))} rowsPerPage={pageSize} rowsPerPageOptions={[pageSize]} onPageChange={(_, value) => setPage(value)} sx={{ '.MuiTablePagination-toolbar': { justifyContent: 'flex-end' } }} />}
  </div>;
}
