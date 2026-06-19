import { useState } from "react";
import { 
  useListAccounts, 
  useListDepartments,
  useCreateAccount,
  useCreateDepartment,
  useGetMyProfile,
  getListAccountsQueryKey,
  getListDepartmentsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { data: profile } = useGetMyProfile();
  const canManage = profile?.canManage;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading: accountsLoading } = useListAccounts();
  const { data: departments, isLoading: deptsLoading } = useListDepartments();

  const createAccount = useCreateAccount();
  const createDepartment = useCreateDepartment();

  const [newAccCode, setNewAccCode] = useState("");
  const [newAccName, setNewAccName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptName, setNewDeptName] = useState("");

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    try {
      await createAccount.mutateAsync({ data: { code: newAccCode, name: newAccName, active: true } });
      toast({ title: "Account created" });
      setNewAccCode("");
      setNewAccName("");
      queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    try {
      await createDepartment.mutateAsync({ data: { code: newDeptCode, name: newDeptName, active: true } });
      toast({ title: "Department created" });
      setNewDeptCode("");
      setNewDeptName("");
      queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 md:p-8 bg-muted/10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin / Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage system master data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Chart of Accounts</CardTitle>
            <CardDescription>Accounts available for cheque allocation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleCreateAccount} className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium">Code</label>
                <Input value={newAccCode} onChange={e => setNewAccCode(e.target.value)} required disabled={!canManage} />
              </div>
              <div className="space-y-1 flex-[2]">
                <label className="text-xs font-medium">Name</label>
                <Input value={newAccName} onChange={e => setNewAccName(e.target.value)} required disabled={!canManage} />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button type="submit" disabled={!canManage || createAccount.isPending}>Add</Button>
                  </div>
                </TooltipTrigger>
                {!canManage && <TooltipContent>You need admin access to add accounts.</TooltipContent>}
              </Tooltip>
            </form>

            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountsLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                  ) : accounts?.map(acc => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-mono text-xs">{acc.code}</TableCell>
                      <TableCell>{acc.name}</TableCell>
                      <TableCell>
                        <Badge variant={acc.active ? "secondary" : "outline"}>{acc.active ? "Active" : "Inactive"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Departments available for cheque allocation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleCreateDepartment} className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium">Code</label>
                <Input value={newDeptCode} onChange={e => setNewDeptCode(e.target.value)} required disabled={!canManage} />
              </div>
              <div className="space-y-1 flex-[2]">
                <label className="text-xs font-medium">Name</label>
                <Input value={newDeptName} onChange={e => setNewDeptName(e.target.value)} required disabled={!canManage} />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button type="submit" disabled={!canManage || createDepartment.isPending}>Add</Button>
                  </div>
                </TooltipTrigger>
                {!canManage && <TooltipContent>You need admin access to add departments.</TooltipContent>}
              </Tooltip>
            </form>

            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptsLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                  ) : departments?.map(dept => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-mono text-xs">{dept.code}</TableCell>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell>
                        <Badge variant={dept.active ? "secondary" : "outline"}>{dept.active ? "Active" : "Inactive"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
