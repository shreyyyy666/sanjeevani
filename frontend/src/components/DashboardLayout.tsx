import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";
import { Activity, BookOpenCheck, Building2, FileSearch, FolderOpen, LayoutDashboard, LogOut, Network, PanelLeft, PlusCircle } from "lucide-react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const primaryItems = [
  { icon: PlusCircle, label: "New Assessment", path: "/workspace/new" },
  { icon: FolderOpen, label: "My Research", path: "/workspace/research" },
  { icon: Activity, label: "Analysis Runs", path: "/workspace" },
  { icon: FileSearch, label: "Evidence and Reports", path: "/workspace/reports" },
  { icon: BookOpenCheck, label: "Patent Guidance", path: "/workspace/patent-guidance" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    return (
      <div className="noise-grid flex min-h-screen items-center justify-center px-5">
        <div className="glass-panel w-full max-w-md rounded-[1.75rem] p-8 text-center">
          <p className="mono text-[11px] uppercase tracking-[0.18em] text-primary">Private research workspace</p>
          <h1 className="editorial-display mt-3 text-4xl text-foreground">Sign in before you upload.</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">Sanjeevani keeps research assessments scoped to the authenticated researcher or authorized institution.</p>
          <Button className="mt-7 w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => startLogin()}>Sign in to workspace</Button>
        </div>
      </div>
    );
  }
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const access = trpc.sanjeevani.access.useQuery();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const navItems = user?.role === "admin" ? [...primaryItems, { icon: Network, label: "Institutional Network", path: "/workspace/network" }] : [...primaryItems, { icon: Building2, label: "Institutional Network", path: "/workspace/network" }];
  const active = navItems.find((item) => location === item.path) ?? (location.startsWith("/workspace/analysis/") ? { label: "Analysis detail" } : { label: "Research workspace" });

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-white/8 bg-[#111325] text-slate-100">
        <SidebarHeader className="h-[82px] justify-center border-b border-white/8 px-3">
          <div className="flex w-full items-center gap-3">
            <button onClick={() => setLocation("/workspace")} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/10 mono text-xs font-medium text-primary">S</span>
              <span className="group-data-[collapsible=icon]:hidden">
                <span className="block text-sm font-semibold tracking-tight">Sanjeevani</span>
                <span className="mono block text-[9px] uppercase tracking-[0.16em] text-slate-400">Research desk</span>
              </span>
            </button>
            <PanelLeft className="size-4 text-slate-500 group-data-[collapsible=icon]:hidden" aria-hidden="true" />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <p className="mono px-3 pb-2 text-[9px] uppercase tracking-[0.16em] text-slate-500 group-data-[collapsible=icon]:hidden">Assessment workflow</p>
          <SidebarMenu>
            {navItems.map((item) => {
              const selected = location === item.path || (item.path === "/workspace" && location.startsWith("/workspace/analysis/"));
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton tooltip={item.label} isActive={selected} onClick={() => setLocation(item.path)} className="h-10 rounded-lg text-slate-300 hover:bg-white/7 hover:text-white data-[active=true]:bg-primary/12 data-[active=true]:text-primary">
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          <div className="mx-2 mt-6 rounded-xl border border-white/8 bg-white/[0.035] p-3 group-data-[collapsible=icon]:hidden">
            <p className="mono text-[9px] uppercase tracking-[0.15em] text-primary">Boundaries on</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">Screening guidance only. Legal, clinical, and filing decisions require qualified review.</p>
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/8 p-3">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-white/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Avatar className="size-8 border border-white/12"><AvatarFallback className="bg-primary/15 text-xs text-primary">{user?.name?.charAt(0).toUpperCase() || "R"}</AvatarFallback></Avatar>
            <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><span className="block truncate text-xs font-medium text-white">{user?.name || "Researcher"}</span><span className="block truncate text-[10px] text-slate-500">{access.data?.level === "institutional_reviewer" ? "Institutional reviewer" : access.data?.level === "administrator" ? "Administrator" : "Researcher"}</span></span>
            <LogOut className="size-3.5 text-slate-500 group-data-[collapsible=icon]:hidden" />
          </button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-h-screen bg-[#17192a] text-foreground">
        {isMobile && <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/8 bg-[#17192a]/95 px-3 backdrop-blur"><SidebarTrigger className="size-9 rounded-lg border border-white/10 bg-white/5" /><span className="text-sm font-medium">{active.label}</span></div>}
        <main className="min-h-screen p-4 md:p-7">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
