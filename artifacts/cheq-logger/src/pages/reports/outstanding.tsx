import { useGetOutstandingReport } from "@workspace/api-client-react";
import { useDateRange } from "@/lib/date-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useLocation } from "wouter";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function OutstandingReport() {
  const [, setLocation] = useLocation();
  const { startDate, endDate } = useDateRange();
  const { data: report, isLoading } = useGetOutstandingReport({ startDate, endDate });

  return (
    <div className="flex-1 overflow-auto p-6 md:p-8 bg-muted/10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Outstanding Cheques</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Uncleared cheques from {format(new Date(startDate), "MMM d, yyyy")} to {format(new Date(endDate), "MMM d, yyyy")}.
          </p>
        </div>
        {report && (
          <div className="text-right bg-card px-4 py-2 rounded border shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total Outstanding</p>
            <p className="text-xl font-bold text-chart-3">{formatCurrency(report.totalAmount)}</p>
            <p className="text-xs text-muted-foreground">{report.totalCount} cheques</p>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Cheque #</TableHead>
                <TableHead>Payee</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Loading report...</TableCell>
                </TableRow>
              ) : report?.cheques.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No outstanding cheques for selected date range.</TableCell>
                </TableRow>
              ) : (
                report?.cheques.map(cheque => (
                  <TableRow 
                    key={cheque.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setLocation(`/cheques/${cheque.id}`)}
                  >
                    <TableCell className="font-medium">{format(new Date(cheque.issueDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="font-mono text-xs">{cheque.chequeNumber}</TableCell>
                    <TableCell>{cheque.payee}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{cheque.accountName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{cheque.departmentName}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(cheque.amount)}</TableCell>
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
