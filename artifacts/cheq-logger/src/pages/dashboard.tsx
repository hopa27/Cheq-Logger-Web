import { useGetDashboardSummary } from "@/lib/local-data";
import { MdFormatListNumbered, MdErrorOutline, MdCheckCircleOutline, MdHighlightOff } from "react-icons/md";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#e7ebec] animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#e7ebec] animate-pulse rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-semibold font-['Livvic'] text-[#002f5c]">Dashboard Overview</h2>
          <p className="text-[#3d3d3d] font-['Mulish'] mt-1">Summary of cheque register activity.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" asChild>
            <Link href="/reports/accounts">Accounts Report</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/reports/departments">Dept Report</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/reports/outstanding">O/S Cheques</Link>
          </Button>
          <Button asChild>
            <Link href="/cheques/new">New Cheque</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[8px] border border-[#BBBBBB] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-['Livvic'] font-semibold text-[#002f5c]">Total Cheques</h3>
            <MdFormatListNumbered className="h-6 w-6 text-[#006cf4]" />
          </div>
          <div className="text-[32px] font-['Livvic'] font-bold text-[#3d3d3d]">{summary.totalCheques}</div>
          <p className="text-[16px] font-['Mulish'] text-[#006cf4] font-bold mt-1">
            {formatCurrency(summary.totalAmount)}
          </p>
        </div>

        <div className="bg-white rounded-[8px] border border-[#BBBBBB] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-['Livvic'] font-semibold text-[#002f5c]">Outstanding</h3>
            <MdErrorOutline className="h-6 w-6 text-[#d72714]" />
          </div>
          <div className="text-[32px] font-['Livvic'] font-bold text-[#3d3d3d]">{summary.outstandingCount}</div>
          <p className="text-[16px] font-['Mulish'] text-[#d72714] font-bold mt-1">
            {formatCurrency(summary.outstandingAmount)}
          </p>
        </div>

        <div className="bg-white rounded-[8px] border border-[#BBBBBB] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-['Livvic'] font-semibold text-[#002f5c]">Cleared</h3>
            <MdCheckCircleOutline className="h-6 w-6 text-[#178830]" />
          </div>
          <div className="text-[32px] font-['Livvic'] font-bold text-[#3d3d3d]">{summary.clearedCount}</div>
          <p className="text-[16px] font-['Mulish'] text-[#178830] font-bold mt-1">
            {formatCurrency(summary.clearedAmount)}
          </p>
        </div>

        <div className="bg-white rounded-[8px] border border-[#BBBBBB] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-['Livvic'] font-semibold text-[#002f5c]">Cancelled</h3>
            <MdHighlightOff className="h-6 w-6 text-[#979797]" />
          </div>
          <div className="text-[32px] font-['Livvic'] font-bold text-[#3d3d3d]">{summary.cancelledCount}</div>
        </div>
      </div>
    </div>
  );
}