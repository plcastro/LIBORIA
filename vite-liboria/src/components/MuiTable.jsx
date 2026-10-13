import { useMemo, useState } from "react";
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from "@mui/material";

export default function MuiTable({ columns = [], dataSource = [], rowKey = "key", loading, pagination = {}, scroll, size, locale }) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState(null);
  const pageSize = pagination === false ? dataSource.length || 1 : pagination.pageSize || 10;
  const rows = useMemo(() => {
    if (!sort) return dataSource;
    const column = columns.find((item) => (item.key || item.dataIndex) === sort.key);
    if (!column?.sorter) return dataSource;
    return [...dataSource].sort((a, b) => {
      const compare = typeof column.sorter === "function" ? column.sorter(a, b) : String(a[column.dataIndex] ?? "").localeCompare(String(b[column.dataIndex] ?? ""));
      return compare * (sort.direction === "asc" ? 1 : -1);
    });
  }, [columns, dataSource, sort]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(rows.length / pageSize) - 1));
  const shown = pagination === false ? rows : rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const responsive = (column) => column.responsive?.includes("sm") ? { display: { xs: "none", sm: "table-cell" } } : {};

  return <div style={{ position: "relative" }}>
    {loading && <CircularProgress size={24} sx={{ position: "absolute", top: 16, left: "50%", zIndex: 1 }} />}
    <TableContainer sx={{ maxHeight: scroll?.y, overflowX: scroll?.x ? "auto" : undefined }}>
      <Table size={size === "small" ? "small" : "medium"} stickyHeader={Boolean(scroll?.y)} sx={{
        minWidth: scroll?.x,
        "& .MuiTableCell-root": { fontFamily: "inherit", borderColor: "#f0f0f0", fontSize: 14, padding: size === "small" ? "8px 8px" : "12px 16px" },
        "& .MuiTableCell-head": { background: "#fafafa", fontWeight: 600 },
      }}>
        <TableHead><TableRow>{columns.map((column, index) => {
          const key = column.key || column.dataIndex || index;
          return <TableCell key={key} align={column.align} sx={{ width: column.width, ...responsive(column) }}>
            {column.sorter ? <TableSortLabel active={sort?.key === key} direction={sort?.key === key ? sort.direction : "asc"} onClick={() => { setSort((previous) => ({ key, direction: previous?.key === key && previous.direction === "asc" ? "desc" : "asc" })); setPage(0); }}>{column.title}</TableSortLabel> : column.title}
          </TableCell>;
        })}</TableRow></TableHead>
        <TableBody>{shown.length ? shown.map((row, index) => <TableRow key={typeof rowKey === "function" ? rowKey(row) : row[rowKey] ?? row._id ?? index} hover>
          {columns.map((column, cell) => <TableCell key={column.key || column.dataIndex || cell} align={column.align} sx={{ width: column.width, ...responsive(column) }}>
            {column.render ? column.render(row[column.dataIndex], row, index) : row[column.dataIndex]}
          </TableCell>)}
        </TableRow>) : <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 5, color: "#999" }}>{locale?.emptyText || "No data"}</TableCell></TableRow>}</TableBody>
      </Table>
    </TableContainer>
    {pagination !== false && rows.length > pageSize && <TablePagination component="div" count={rows.length} page={currentPage} rowsPerPage={pageSize} rowsPerPageOptions={[pageSize]} onPageChange={(_, value) => setPage(value)} sx={{ "& .MuiTablePagination-toolbar": { justifyContent: "flex-end" }, "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input": { display: "none" } }} />}
  </div>;
}
