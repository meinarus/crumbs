"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
  pageSize?: number;
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (searchValue: string) => void;
  searchValue?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchColumn,
  pageSize = 10,
  totalCount,
  currentPage = 0,
  onPageChange,
  onSearch,
  searchValue: controlledSearchValue = "",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const isServerSide = !!onPageChange;

  const globalFilterFn = React.useCallback(
    (row: Row<TData>, columnId: string, filterValue: string) => {
      const search = filterValue.trim().toLowerCase();
      if (!search) return true;
      const value = row.getValue(columnId);
      return String(value).toLowerCase().includes(search);
    },
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: isServerSide,
    pageCount: isServerSide
      ? Math.ceil((totalCount ?? 0) / pageSize)
      : undefined,
    initialState: {
      pagination: {
        pageSize,
        pageIndex: currentPage,
      },
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      ...(isServerSide && { pagination: { pageIndex: currentPage, pageSize } }),
    },
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  const pageCount = isServerSide
    ? Math.ceil((totalCount ?? 0) / pageSize)
    : table.getPageCount();
  const pageIndex = isServerSide
    ? currentPage
    : table.getState().pagination.pageIndex;
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  const handlePreviousPage = () => {
    if (isServerSide && onPageChange) {
      onPageChange(currentPage - 1);
    } else {
      table.previousPage();
    }
  };

  const handleNextPage = () => {
    if (isServerSide && onPageChange) {
      onPageChange(currentPage + 1);
    } else {
      table.nextPage();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder={searchPlaceholder}
          value={
            onSearch
              ? controlledSearchValue
              : searchColumn
                ? ((table
                    .getColumn(searchColumn)
                    ?.getFilterValue() as string) ?? "")
                : globalFilter
          }
          onChange={(event) => {
            const value = event.target.value;
            if (onSearch) {
              onSearch(value);
            } else if (searchColumn) {
              table.getColumn(searchColumn)?.setFilterValue(value);
            } else {
              setGlobalFilter(value);
            }
          }}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows?.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Page {pageIndex + 1} of {pageCount || 1}
          {isServerSide && totalCount !== undefined && (
            <span className="ml-2">({totalCount} total)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!canPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!canNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
