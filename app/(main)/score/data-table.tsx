'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  currentUserData?: TData;
  isLoading?: boolean;
}

const LOADING_TABLE_ROWS = 20;

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  currentUserData,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const allData = React.useMemo(() => {
    if (!currentUserData) return data;
    return [currentUserData, ...data.filter(item => item !== currentUserData)];
  }, [data, currentUserData]);

  const table = useReactTable({
    data: allData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  // Calculate visible page range
  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();
  const maxVisiblePages = 5;

  let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  // Adjust start if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  const showStartEllipsis = startPage > 0;
  const showEndEllipsis = endPage < totalPages - 1;

  return (
    <>
      <Table className="border-collapse border-spacing-0 overflow-hidden rounded-lg border shadow-sm">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
              {headerGroup.headers.map(header => {
                return (
                  <TableHead
                    key={header.id}
                    className="py-3 text-sm font-semibold text-muted-foreground first:pl-6 last:pr-6"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        {isLoading ? (
          <TableBody>
            {Array.from({ length: LOADING_TABLE_ROWS }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell colSpan={1} className="h-12 text-center">
                  <Skeleton className="mx-auto h-4 w-[60%]" />
                </TableCell>
                <TableCell colSpan={1} className="h-12 text-center">
                  <Skeleton className="mx-auto h-4 w-[60%]" />
                </TableCell>
                <TableCell colSpan={1} className="h-12 text-center">
                  <Skeleton className="mx-auto h-4 w-[60%]" />
                </TableCell>
                <TableCell colSpan={1} className="flex h-12 justify-end">
                  <Skeleton className="h-4 w-[60%]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        ) : (
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'cursor-pointer transition-colors duration-200',
                    'hover:bg-muted/80 active:bg-muted',
                    index === 0 && currentUserData
                      ? 'bg-primary/10 hover:bg-primary/20 dark:bg-primary/5 dark:hover:bg-primary/10'
                      : ''
                  )}
                  onClick={() => onRowClick?.(row.original as TData)}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-3 text-sm first:pl-6 last:pr-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>

      <div className="mt-4 flex items-center justify-center space-x-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  table.previousPage();
                }}
                aria-disabled={!table.getCanPreviousPage()}
                className={cn(
                  'transition-colors duration-200',
                  !table.getCanPreviousPage() && 'cursor-not-allowed opacity-50'
                )}
              />
            </PaginationItem>

            {showStartEllipsis && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      table.setPageIndex(0);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              </>
            )}

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
              pageIndex => (
                <PaginationItem key={pageIndex}>
                  <PaginationLink
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      table.setPageIndex(pageIndex);
                    }}
                    isActive={table.getState().pagination.pageIndex === pageIndex}
                    className="transition-colors duration-200"
                  >
                    {pageIndex + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            {showEndEllipsis && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      table.setPageIndex(totalPages - 1);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (table.getCanNextPage()) {
                    table.nextPage();
                  }
                }}
                aria-disabled={!table.getCanNextPage()}
                className={cn(
                  'transition-colors duration-200',
                  !table.getCanNextPage() && 'cursor-not-allowed opacity-50'
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
