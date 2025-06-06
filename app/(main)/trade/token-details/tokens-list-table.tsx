'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TokenPair, useAllTokens } from '@/hooks/queries/use-all-tokens';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { usePopupStore } from '@/stores/popup-store';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { shortenAddress } from '@/utils/crypto';
import { toast } from 'sonner';

export const columns: ColumnDef<TokenPair>[] = [
  {
    accessorKey: 'TokenA.Name',
    header: 'Symbol',
  },
  {
    accessorKey: 'TokenA.Address',
    header: 'Address',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          {shortenAddress(row.original.TokenA.Address)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(row.original.TokenA.Address);
              toast.success(`Copied!`, {
                description: row.original.TokenA.Address,
              });
            }}
          >
            <Copy />
          </Button>
        </div>
      );
    },
  },
];

export default function TokensListTable() {
  const { closePopup } = usePopupStore();
  const { data } = useAllTokens();
  const router = useRouter();

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-2">
      <Input placeholder="Search token..." />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <TableHead key={header.id}>
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                onClick={() => {
                  router.push(`?token=${row.original.TokenA.Address}`);
                  closePopup('tokens-list');
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns?.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
