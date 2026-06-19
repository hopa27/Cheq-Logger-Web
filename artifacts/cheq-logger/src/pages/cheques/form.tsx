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
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
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
    amount: "",
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
        amount: cheque.amount.toString(),
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
        amount: Number(formData.amount),
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

      // Invalidate relevant queries
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
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex-1 overflow-auto bg-muted/10 p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setLocation("/cheques")} className="gap-2 -ml-3 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Register
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isNew ? "New Cheque" : "Amend Cheque"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="chequeNumber">Cheque Number</Label>
                  <Input 
                    id="chequeNumber" 
                    value={formData.chequeNumber} 
                    onChange={e => setFormData(p => ({ ...p, chequeNumber: e.target.value }))}
                    required
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input 
                    id="issueDate" 
                    type="date"
                    value={formData.issueDate} 
                    onChange={e => setFormData(p => ({ ...p, issueDate: e.target.value }))}
                    required
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payee">Payee</Label>
                  <Input 
                    id="payee" 
                    value={formData.payee} 
                    onChange={e => setFormData(p => ({ ...p, payee: e.target.value }))}
                    required
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount} 
                    onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                    required
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Select 
                    value={formData.accountId} 
                    onValueChange={v => setFormData(p => ({ ...p, accountId: v }))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.filter(a => a.active || a.id.toString() === formData.accountId).map(a => (
                        <SelectItem key={a.id} value={a.id.toString()}>{a.code} - {a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.departmentId} 
                    onValueChange={v => setFormData(p => ({ ...p, departmentId: v }))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.filter(d => d.active || d.id.toString() === formData.departmentId).map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.code} - {d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={v => setFormData(p => ({ ...p, status: v as ChequeStatus }))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outstanding">Outstanding</SelectItem>
                      <SelectItem value="cleared">Cleared</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.status === 'cleared' && (
                  <div className="space-y-2">
                    <Label htmlFor="clearedDate">Cleared Date</Label>
                    <Input 
                      id="clearedDate" 
                      type="date"
                      value={formData.clearedDate} 
                      onChange={e => setFormData(p => ({ ...p, clearedDate: e.target.value }))}
                      required={formData.status === 'cleared'}
                      disabled={!canEdit}
                    />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    value={formData.notes} 
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        type="submit" 
                        disabled={!canEdit || createMutation.isPending || updateMutation.isPending}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
