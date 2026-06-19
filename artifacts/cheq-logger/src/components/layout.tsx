import { useAuth } from "@workspace/replit-auth-web";
import { useGetMyProfile } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useDateRange } from "@/lib/date-context";
import { 
  LayoutDashboard, 
  ListOrdered, 
  FileText, 
  Settings, 
  LogOut,
  Calendar
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { data: profile } = useGetMyProfile();
  const [location] = useLocation();
  const { startDate, endDate, setStartDate, setEndDate } = useDateRange();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold font-mono tracking-tight text-sidebar-primary">CHEQ<span className="text-sidebar-foreground">Logger</span></h1>
        </div>

        {/* Global Date Range */}
        <div className="p-4 border-b border-sidebar-border space-y-3">
          <div className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Date Range</div>
          <div className="space-y-2">
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-sidebar-accent border border-sidebar-border rounded px-8 py-2 text-sm text-sidebar-foreground outline-none focus:ring-1 focus:ring-sidebar-ring"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-sidebar-accent border border-sidebar-border rounded px-8 py-2 text-sm text-sidebar-foreground outline-none focus:ring-1 focus:ring-sidebar-ring"
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent'}`}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/cheques" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.startsWith('/cheques') ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent'}`}>
            <ListOrdered className="h-4 w-4" />
            Cheque Register
          </Link>
          
          <div className="pt-4 pb-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Reports</div>
          <Link href="/reports/accounts" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/reports/accounts' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent'}`}>
            <FileText className="h-4 w-4" />
            Accounts
          </Link>
          <Link href="/reports/departments" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/reports/departments' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent'}`}>
            <FileText className="h-4 w-4" />
            Departments
          </Link>
          <Link href="/reports/outstanding" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/reports/outstanding' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent'}`}>
            <FileText className="h-4 w-4" />
            O/S Cheques
          </Link>

          <div className="pt-4 pb-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">System</div>
          <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/admin' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent'}`}>
            <Settings className="h-4 w-4" />
            Admin / Setup
          </Link>
        </nav>

        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/50">
          {profile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile.profileImageUrl || ''} />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{profile.firstName} {profile.lastName}</span>
                  <span className="text-xs text-sidebar-foreground/70">{profile.role}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="h-9 animate-pulse bg-sidebar-accent rounded" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
