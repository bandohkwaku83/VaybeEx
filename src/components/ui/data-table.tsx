"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  showTotal?: (total: number) => string;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  loading?: boolean;
  pagination?: PaginationProps;
  onRowClick?: (row: TData) => void;
  emptyText?: string;
  className?: string;
  scrollX?: number;
  enableSorting?: boolean;
}

export function DataTable<TData>({
  data,
  columns,
  loading = false,
  pagination,
  onRowClick,
  emptyText = "No data found.",
  className,
  scrollX,
  enableSorting = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    state: {
      sorting,
    },
  });

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto" style={scrollX ? { minWidth: scrollX } : undefined}>
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b"
                style={{
                  background: "var(--bg-secondary, #f2eada)",
                  borderColor: "var(--border, rgba(0,0,0,0.08))",
                }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: "var(--text-secondary, #6b5544)",
                      width: header.column.columnDef.size
                        ? `${header.column.columnDef.size}px`
                        : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex items-center justify-center gap-2" style={{ color: "var(--text-tertiary, #9c8773)" }}>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading…</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm"
                  style={{ color: "var(--text-tertiary, #9c8773)" }}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b transition-colors",
                    onRowClick && "cursor-pointer hover:bg-[var(--bg-hover, rgba(0,0,0,0.02))]"
                  )}
                  style={{
                    borderColor: "var(--border, rgba(0,0,0,0.08))",
                  }}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3.5"
                      style={{ color: "var(--text, #171717)" }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div
          className="flex items-center justify-between border-t px-4 py-3"
          style={{
            borderColor: "var(--border, rgba(0,0,0,0.08))",
          }}
        >
          <span className="text-xs" style={{ color: "var(--text-tertiary, #9c8773)" }}>
            {pagination.showTotal
              ? pagination.showTotal(pagination.total)
              : `${pagination.total} result${pagination.total === 1 ? "" : "s"}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pagination.current <= 1}
              onClick={() => pagination.onChange(pagination.current - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-40"
              style={{
                borderColor: "var(--border, rgba(0,0,0,0.12))",
                color: "var(--text-secondary, #6b5544)",
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (pagination.current <= 4) {
                pageNum = i + 1;
              } else if (pagination.current >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = pagination.current - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => pagination.onChange(pageNum)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background:
                      pagination.current === pageNum
                        ? "var(--primary, #6b3f1d)"
                        : "transparent",
                    color:
                      pagination.current === pageNum
                        ? "#fff"
                        : "var(--text-secondary, #6b5544)",
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              disabled={pagination.current >= totalPages}
              onClick={() => pagination.onChange(pagination.current + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-40"
              style={{
                borderColor: "var(--border, rgba(0,0,0,0.12))",
                color: "var(--text-secondary, #6b5544)",
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
