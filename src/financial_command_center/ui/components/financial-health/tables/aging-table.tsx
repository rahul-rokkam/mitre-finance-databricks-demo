import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CashPosition } from "../types";
import { formatCurrency } from "../charts/chart-utils";
import { getDsoStatus, getStatusColorClasses } from "../status-rules";

interface AgingTableProps {
  cashPosition: CashPosition;
}

export function AgingTable({ cashPosition }: AgingTableProps) {
  const { cashBalance, workingCapital, dso, dpo, agingBuckets } = cashPosition;
  const dsoStatus = getDsoStatus(dso);
  const dsoColors = getStatusColorClasses(dsoStatus);

  const totalAR = agingBuckets.reduce((sum, bucket) => sum + bucket.ar, 0);
  const totalAP = agingBuckets.reduce((sum, bucket) => sum + bucket.ap, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Cash & Working Capital</CardTitle>
            <CardDescription>AR/AP aging and liquidity metrics</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
            <div className="text-sm text-muted-foreground">
              Working capital: {formatCurrency(workingCapital)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`p-3 rounded-lg ${dsoColors.bg}`}>
            <div className="text-xs text-muted-foreground mb-1">Days Sales Outstanding</div>
            <div className={`text-xl font-bold ${dsoColors.text}`}>{dso} days</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Days Payable Outstanding</div>
            <div className="text-xl font-bold">{dpo} days</div>
          </div>
        </div>

        {/* Aging Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Aging Bucket</TableHead>
                <TableHead className="text-right">AR</TableHead>
                <TableHead className="text-right">AP</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agingBuckets.map((bucket) => (
                <TableRow key={bucket.label}>
                  <TableCell className="font-medium">{bucket.label}</TableCell>
                  <TableCell className="text-right">{formatCurrency(bucket.ar)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(bucket.ap)}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      bucket.ar - bucket.ap >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(bucket.ar - bucket.ap)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/30">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{formatCurrency(totalAR)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalAP)}</TableCell>
                <TableCell
                  className={`text-right ${
                    totalAR - totalAP >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(totalAR - totalAP)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


