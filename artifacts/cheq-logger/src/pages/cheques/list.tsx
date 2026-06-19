import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  useListCheques, 
  useListAccounts, 
  useListDepartments, 
  useGetMyProfile,
  ChequeStatus
} from "@workspace/api-client-react";
import { useDateRange } from "@/lib/date-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, Plus } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function ChequeList() {
  const [, setLocation] = useLocation();
  const { startDate, endDate } = useDateRange();
  const { data: profile } = useGetMyProfile();
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [accountId, setAccountId] = useState<string>("all");
  const [departmentId, setDepartmentId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data: accounts } = useListAccounts();
  const { data: departments } = useListDepartments();

  const { data: cheques, isLoading } = useListCheques({
    startDate,
    endDate,
    accountId: accountId !== "all" ? Number(accountId) : undefined,
    departmentId: departmentId !== "all" ? Number(departmentId) : undefined,
    status: status !== "all" ? status as ChequeStatus : undefined,
    search: debouncedSearch || undefined,
  });

  const canEdit = profile?.canEdit;

  return (
    <div className="flex-1 flex flex-col h-full bg-muted/10">
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cheque Register</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and filter all recorded cheques.</p>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  onClick={() => setLocation("/cheques/new")}
                  disabled={!canEdit}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New / Amend
                </Button>
              </div>
            </TooltipTrigger>
            {!canEdit && (
              <TooltipContent>You need edit access to create cheques.</TooltipContent>
            )}
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payee or cheque #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => setDebouncedSearch(search)}
              onKeyDown={(e) => e.key === 'Enter' && setDebouncedSearch(search)}
              className="pl-9"
            />
          </div>
          
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts?.map(a => (
                <SelectItem key={a.id} value={a.id.toString()}>{a.code} - {a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map(d => (
                <SelectItem key={d.id} value={d.id.toString()}>{d.code} - {d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="outstanding">Outstanding</SelectItem>
              <SelectItem value="cleared">Cleared</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-md border border-border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Cheque #</TableHead>
                <TableHead>Payee</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading cheques...
                  </TableCell>
                </TableRow>
              ) : cheques?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No cheques found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                cheques?.map((cheque) => (
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
                    <TableCell>
                      <Badge variant={
                        cheque.status === 'cleared' ? 'default' :
                        cheque.status === 'cancelled' ? 'destructive' :
                        'secondary'
                      }>
                        {cheque.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
