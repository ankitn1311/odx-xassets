'use client';
import { useState } from 'react';

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Table className="w-full table-fixed">
      <TableHeader className="">
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id} className="hover:cursor-pointer hover:bg-background">
            {headerGroup.headers.map(header => {
              // const columnId = header.column.id;
              // let margin = "";
              // console.log(`columnID::: ${columnId}`);
              // columnId == "price" ? (margin = "bg-red-500 text-right ") : "";
              return (
                <TableHead
                  key={header.id}
                  className={'w-1/4 border-b-0 py-2 first:pl-4 last:pr-4 last:text-right'}
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
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map(row => (
            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
              {row.getVisibleCells().map(cell => {
                const cellData = {
                  id: cell.id,
                  value: cell.getValue(),
                  rowId: cell.row.id,
                  columnId: cell.column.id,
                  columnDef: cell.column.columnDef,
                };

                // console.log(`cellData::: ${JSON.stringify(cellData, null, 2)}`);
                // let clsNm = " "
                // if (cellData.id.split('_')[1] === 'tokenName') {
                //   clsNm = "bg-teal-500 mb-100 w-full"
                // }
                return (
                  <TableCell
                    key={cell.id}
                    className="w-1/4 py-2 first:pl-4 last:pr-4 last:text-right"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length}>No results.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
