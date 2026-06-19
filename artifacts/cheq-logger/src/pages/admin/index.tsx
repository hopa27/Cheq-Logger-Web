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
import { DataGrid, DataGridHeader, DataGridRow, DataGridHead, DataGridBody, DataGridCell } from "@/components/ui/data-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-8">
      <div>
        <h2 className="text-[24px] font-semibold font-['Livvic'] text-[#002f5c]">Admin / Setup</h2>
        <p className="text-[#3d3d3d] font-['Mulish'] mt-1">Manage system master data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[8px] border border-[#BBBBBB] shadow-sm space-y-6">
          <div>
            <h3 className="text-[20px] font-semibold font-['Livvic'] text-[#002f5c]">Chart of Accounts</h3>
            <p className="text-[14px] text-[#3d3d3d] font-['Mulish']">Accounts available for cheque allocation.</p>
          </div>
          
          <form onSubmit={handleCreateAccount} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-[14px] font-bold font-['Mulish'] text-[#3d3d3d]">Code</label>
              <Input value={newAccCode} onChange={e => setNewAccCode(e.target.value)} required disabled={!canManage} />
            </div>
            <div className="space-y-2 flex-[2]">
              <label className="text-[14px] font-bold font-['Mulish'] text-[#3d3d3d]">Name</label>
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

          <DataGrid>
            <DataGridHeader>
              <DataGridRow className="hover:bg-transparent odd:bg-transparent even:bg-transparent">
                <DataGridHead sortable>Code</DataGridHead>
                <DataGridHead sortable>Name</DataGridHead>
                <DataGridHead>Status</DataGridHead>
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody>
              {accountsLoading ? (
                <DataGridRow><DataGridCell colSpan={3} className="text-center py-4">Loading...</DataGridCell></DataGridRow>
              ) : accounts?.map(acc => (
                <DataGridRow key={acc.id}>
                  <DataGridCell>{acc.code}</DataGridCell>
                  <DataGridCell>{acc.name}</DataGridCell>
                  <DataGridCell>{acc.active ? "Active" : "Inactive"}</DataGridCell>
                </DataGridRow>
              ))}
            </DataGridBody>
          </DataGrid>
        </div>

        <div className="bg-white p-6 rounded-[8px] border border-[#BBBBBB] shadow-sm space-y-6">
          <div>
            <h3 className="text-[20px] font-semibold font-['Livvic'] text-[#002f5c]">Departments</h3>
            <p className="text-[14px] text-[#3d3d3d] font-['Mulish']">Departments available for cheque allocation.</p>
          </div>
          
          <form onSubmit={handleCreateDepartment} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-[14px] font-bold font-['Mulish'] text-[#3d3d3d]">Code</label>
              <Input value={newDeptCode} onChange={e => setNewDeptCode(e.target.value)} required disabled={!canManage} />
            </div>
            <div className="space-y-2 flex-[2]">
              <label className="text-[14px] font-bold font-['Mulish'] text-[#3d3d3d]">Name</label>
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

          <DataGrid>
            <DataGridHeader>
              <DataGridRow className="hover:bg-transparent odd:bg-transparent even:bg-transparent">
                <DataGridHead sortable>Code</DataGridHead>
                <DataGridHead sortable>Name</DataGridHead>
                <DataGridHead>Status</DataGridHead>
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody>
              {deptsLoading ? (
                <DataGridRow><DataGridCell colSpan={3} className="text-center py-4">Loading...</DataGridCell></DataGridRow>
              ) : departments?.map(dept => (
                <DataGridRow key={dept.id}>
                  <DataGridCell>{dept.code}</DataGridCell>
                  <DataGridCell>{dept.name}</DataGridCell>
                  <DataGridCell>{dept.active ? "Active" : "Inactive"}</DataGridCell>
                </DataGridRow>
              ))}
            </DataGridBody>
          </DataGrid>
        </div>
      </div>
    </div>
  );
}