import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { tokenConvertForUI } from '@/hooks/mutations/use-trade-quote';
import { DemoAlert } from '@/components/common/demo-alert';
import { fmtCompactUsd, fmtUnits } from '@/lib/format';

export const TokenName = ({
  name,
  symbol,
  image,
}: {
  name: string;
  symbol: string;
  image: string;
}) => {
  return (
    <div className="flex items-center gap-3">
      <Image alt="" src={image} width={36} height={36} loading="lazy" className="h-9 w-9" />
      <div className="flex flex-col leading-tight">
        <div className="text-[15px] font-medium text-foreground">
          {tokenConvertForUI[name as keyof typeof tokenConvertForUI] ?? name}
        </div>
        <div className="text-xs text-muted-foreground">{symbol}</div>
      </div>
    </div>
  );
};

export type ReserveRow = {
  symbol: string;
  name: string; // underlying ticker, e.g. XRP
  image: string;
  minted: number;
  mintedUsd: number;
  inReserve: number;
  inReserveUsd: number;
  ratio: number; // fraction
  custodian: string;
  updatedAt: number;
};

/** Units on the first line, USD on the second. */
const Amount = ({ units, unit, usd }: { units: number; unit: string; usd: number }) => (
  <div className="flex flex-col leading-tight">
    <span className="font-mono text-[15px] tabular-nums">
      {fmtUnits(units)} <span className="font-sans text-xs text-muted-foreground">{unit}</span>
    </span>
    <span className="text-xs text-muted-foreground tabular-nums">{fmtCompactUsd(usd)}</span>
  </div>
);

export const reserveColumns: ColumnDef<ReserveRow>[] = [
  {
    accessorKey: 'symbol',
    header: 'Asset',
    meta: { className: 'min-w-[180px]' },
    cell: ({ row }) => (
      <TokenName name={row.original.name} symbol={row.original.symbol} image={row.original.image} />
    ),
  },
  {
    accessorKey: 'minted',
    header: 'Total Supply of xAsset',
    cell: ({ row }) => (
      <Amount units={row.original.minted} unit={row.original.symbol} usd={row.original.mintedUsd} />
    ),
  },
  {
    accessorKey: 'inReserve',
    header: () => (
      <span className="inline-flex items-center gap-1">
        Units in Reserve <DemoAlert className="h-3 w-3" note="Mirrors total supply; no custody feed yet" />
      </span>
    ),
    cell: ({ row }) => (
      <Amount units={row.original.inReserve} unit={row.original.name} usd={row.original.inReserveUsd} />
    ),
  },
  {
    accessorKey: 'ratio',
    header: () => (
      <span className="inline-flex items-center justify-end gap-1">
        Ratio <DemoAlert className="h-3 w-3" note="Ratio is hardcoded to 100%" />
      </span>
    ),
    meta: { className: 'w-28 text-right' },
    cell: ({ row }) => (
      <span className="font-mono text-[15px] tabular-nums">{Math.round(row.original.ratio * 100)}%</span>
    ),
  },
];
