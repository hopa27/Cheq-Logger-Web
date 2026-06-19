import { useGetAccountsReport } from "@workspace/api-client-react";
import { useDateRange } from "@/lib/date-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function AccountsReport() {
  const { startDate, endDate } = useDateRange();
  const { data: report, isLoading } = useGetAccountsReport({ startDate, endDate });

  return (
    <div className="flex-1 overflow-auto p-6 md:p-8 bg-muted/10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Accounts Report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Activity by account from {format(new Date(startDate), "MMM d, yyyy")} to {format(new Date(endDate), "MMM d, yyyy")}.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Account Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead className="text-right">Total Cheques</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">O/S Cheques</TableHead>
                <TableHead className="text-right">O/S Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Loading report...</TableCell>
                </TableRow>
              ) : report?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No data for selected date range.</TableCell>
                </TableRow>
              ) : (
                report?.map(row => (
                  <TableRow key={row.accountId}>
                    <TableCell className="font-mono text-sm">{row.accountCode}</TableCell>
                    <TableCell className="font-medium">{row.accountName}</TableCell>
                    <TableCell className="text-right">{row.chequeCount}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(row.totalAmount)}</TableCell>
                    <TableCell className="text-right">{row.outstandingCount}</TableCell>
                    <TableCell className="text-right font-medium text-chart-3">{formatCurrency(row.outstandingAmount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
