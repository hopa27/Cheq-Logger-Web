import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { 
  useGetCheque,
  getGetChequeQueryKey,
  useCreateCheque,
  useUpdateCheque,
  useListAccounts,
  useListDepartments,
  useGetMyProfile,
  getListChequesQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetAccountsReportQueryKey,
  getGetDepartmentsReportQueryKey,
  getGetOutstandingReportQueryKey,
  ChequeStatus
} from "@/lib/local-data";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { CounterInput } from "@/components/ui/counter-input";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

export default function ChequeForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: profile } = useGetMyProfile();
  const canEdit = profile?.canEdit;

  const { data: accounts } = useListAccounts();
  const { data: departments } = useListDepartments();

  const { data: cheque, isLoading: loadingCheque } = useGetCheque(
    Number(id), 
    { query: { enabled: !isNew && !!id, queryKey: getGetChequeQueryKey(Number(id)) } }
  );

  const createMutation = useCreateCheque();
  const updateMutation = useUpdateCheque();

  const [formData, setFormData] = useState({
    chequeNumber: "",
    accountId: "",
    departmentId: "",
    payee: "",
    amount: 0,
    issueDate: format(new Date(), "yyyy-MM-dd"),
    status: "outstanding" as ChequeStatus,
    clearedDate: "",
    notes: ""
  });

  useEffect(() => {
    if (cheque && !isNew) {
      setFormData({
        chequeNumber: cheque.chequeNumber,
        accountId: cheque.accountId.toString(),
        departmentId: cheque.departmentId.toString(),
        payee: cheque.payee,
        amount: cheque.amount,
        issueDate: cheque.issueDate.substring(0, 10),
        status: cheque.status,
        clearedDate: cheque.clearedDate ? cheque.clearedDate.substring(0, 10) : "",
        notes: cheque.notes || ""
      });
    }
  }, [cheque, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      const payload = {
        chequeNumber: formData.chequeNumber,
        accountId: Number(formData.accountId),
        departmentId: Number(formData.departmentId),
        payee: formData.payee,
        amount: formData.amount,
        issueDate: formData.issueDate,
        status: formData.status,
        clearedDate: formData.clearedDate || null,
        notes: formData.notes || null,
      };

      if (isNew) {
        const newCheque = await createMutation.mutateAsync({ data: payload });
        toast({ title: "Cheque created successfully" });
        setLocation(`/cheques/${newCheque.id}`);
      } else {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        toast({ title: "Cheque updated successfully" });
      }

      queryClient.invalidateQueries({ queryKey: getListChequesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAccountsReportQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDepartmentsReportQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetOutstandingReportQueryKey() });
      if (!isNew) {
        queryClient.invalidateQueries({ queryKey: getGetChequeQueryKey(Number(id)) });
      }
    } catch (err: any) {
      toast({ 
        title: "Error saving cheque", 
        description: err.message || "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  if (!isNew && loadingCheque) {
    return <div>Loading...</div>;
  }

  const accountOptions = accounts?.filter(a => a.active || a.id.toString() === formData.accountId).map(a => ({ value: a.id.toString(), label: `${a.code} - ${a.name}` })) || [];
  const deptOptions = departments?.filter(d => d.active || d.id.toString() === formData.departmentId).map(d => ({ value: d.id.toString(), label: `${d.code} - ${d.name}` })) || [];
  const statusOptions = [
    { value: "outstanding", label: "Outstanding" },
    { value: "cleared", label: "Cleared" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-semibold font-['Livvic'] text-[#002f5c]">
          {isNew ? "New Cheque" : "Amend Cheque"}
        </h2>
        <Button variant="ghost" onClick={() => setLocation("/cheques")}>
          Cancel
        </Button>
      </div>

      <div className="bg-white p-8 rounded-[8px] border border-[#BBBBBB] shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[16px] font-bold font-['Mulish'] text-[#3d3d3d]">Cheque Number</label>
              <Input 
                value={formData.chequeNumber} 
                onChange={e => setFormData(p => ({ ...p, chequeNumber: e.target.value }))}
                required
                disabled={!canEdit}
                placeholder="Enter cheque number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[16px] font-bold font-['Mulish'] text-[#3d3d3d]">Issue Date</label>
              <DatePicker 
                value={formData.issueDate}
                onChange={v => setFormData(p => ({ ...p, issueDate: v }))}
                disabled={!canEdit}
                placeholder="Select date"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[16px] font-bold font-['Mulish'] text-[#3d3d3d]">Payee</label>
              <Input 
                value={formData.payee} 
                onChange={e => setFormData(p => ({ ...p, payee: e.target.value }))}
                required
                disabled={!canEdit}
                placeholder="Enter payee name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[16px] font-bold font-['Mulish'] text-[#3d3d3d]">Amount</label>
              <CounterInput 
                value={formData.amount} 
                onChange={v => setFormData(p => ({ ...p, amount: v }))}
                required
                disabled={!canEdit}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[16px] font-bold font-['Mulish'] text-[#3d3d3d]">Account</label>
              <Combobox 
                options={accountOptions}
                value={formData.accountId} 
                onChange={v => setFormData(p => ({ ...p, accountId: v }))}
                disabled={!canEdit}
                placeholder="Select Account"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[16px] font-bold font-['Mulish'] text-[#3d3d3d]">Department</label>
              <Combobox 
                options={deptOptions}
                value={formData.departmentId} 
                onChange={v => setFormData(p => ({ ...p, departmentId: v }))}
                disabled={!canEdit}
                placeholder="Select Department"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[16px] font-bold font-['Mulish'] text-[#3d3d3d]">Status</label>
              <Combobox 
                options={statusOptions}
                value={formData.status} 
                onChange={v => setFormData(p => ({ ...p, status: v as ChequeStatus }))}
                disabled={!canEdit}
                placeholder="Select Status"
              />
            </div>

            {formData.status === 'cleared' && (
              <div className="space-y-2">
                <label className="text-[16px] font-bold font-['Mulish'] text-[#3d3d3d]">Cleared Date</label>
                <DatePicker 
                  value={formData.clearedDate}
                  onChange={v => setFormData(p => ({ ...p, clearedDate: v }))}
                  disabled={!canEdit}
                  placeholder="Select date"
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <label className="text-[16px] font-bold font-['Mulish'] text-[#3d3d3d]">Notes</label>
              <Input 
                value={formData.notes} 
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                disabled={!canEdit}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    type="submit" 
                    disabled={!canEdit || createMutation.isPending || updateMutation.isPending}
                  >
                    {isNew ? "Save Cheque" : "Update Cheque"}
                  </Button>
                </div>
              </TooltipTrigger>
              {!canEdit && (
                <TooltipContent>You need edit access to save cheques.</TooltipContent>
              )}
            </Tooltip>
          </div>
        </form>
      </div>
    </div>
  );
}