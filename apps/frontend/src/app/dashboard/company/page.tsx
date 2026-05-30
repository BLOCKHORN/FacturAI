"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Clock,
  LayoutDashboard,
  Zap,
  Users,
  Settings,
  Menu,
  X,
  ArrowUpRight,
  CreditCard,
  Search,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function CompanyDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          if (mounted) window.location.href = "/login";
          return;
        }
        const user = session.user;
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (mounted) {
          setProfile(profileData || { company_name: user.email, id: user.id });
          const { data: invoicesData } = await supabase
            .from("invoices")
            .select("*, client:tenant_private_clients(legal_name)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);
          setInvoices(invoicesData || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0E1117] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#00E676] border-t-transparent rounded-full"
        />
      </div>
    );

  const facturadoMes =
    invoices
      ?.filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + Number(i.total_amount), 0) || 0;
  const pendienteCobro =
    invoices
      ?.filter((i) => i.status === "sent" || i.status === "accepted")
      .reduce((sum, i) => sum + Number(i.total_amount), 0) || 0;

  const isSubscribed =
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing";

  return (
    <div className="flex min-h-screen bg-[#0E1117] text-slate-200 antialiased font-sans selection:bg-[#00E676] selection:text-black overflow-x-hidden w-full">
      {/* SLIM SIDEBAR */}
      <aside className="hidden lg:flex w-20 flex-col border-r border-white/5 bg-[#0A0C10] fixed h-full z-50 items-center py-8 gap-12">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-[#00E676] flex items-center justify-center rounded-none font-black text-black text-lg">
            F
          </div>
        </Link>
        <nav className="flex flex-col gap-8">
          {[
            { icon: LayoutDashboard, active: true, href: "/dashboard/company" },
            { icon: Zap, href: "/invoices" },
            { icon: Users, href: "/clients" },
            { icon: Settings, href: "/settings" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "p-3 transition-all border-l-2",
                item.active
                  ? "border-[#00E676] text-[#00E676]"
                  : "border-transparent text-slate-600 hover:text-white",
              )}
            >
              <item.icon className="w-6 h-6" />
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 lg:pl-20 w-full min-w-0">
        {/* HEADER */}
        <header className="px-6 lg:px-16 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-black/40 backdrop-blur-xl sticky top-0 z-40 border-b border-white/5">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-white/5 border border-white/10"
            >
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Terminal de Empresa
              </h1>
              <div className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic truncate">
                {profile?.company_name}
              </div>
            </div>
          </div>
          <Link href="/invoices/new" className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-[#00E676] text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-3 text-sm">
              <Plus className="w-4 h-4" /> Nueva Emisión
            </button>
          </Link>
        </header>

        <main className="px-6 lg:px-16 py-8 space-y-12 md:space-y-16 max-w-full overflow-x-hidden">
          {/* STARTER QUOTA ALERT */}
          {!isSubscribed && (
            <div className="bg-[#00E676]/5 border border-[#00E676]/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <Zap className="w-5 h-5 text-[#00E676]" />
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white">
                    Modo de Prueba Activo
                  </div>
                  <p className="text-[9px] font-bold leading-loose tracking-widest text-gray-500 uppercase">
                    Te quedan{" "}
                    <strong className="text-[#00E676]">
                      {profile?.invoice_credits} de 3
                    </strong>{" "}
                    facturas gratuitas. Actualiza tu plan para desbloquear
                    emisiones ilimitadas e IA.
                  </p>
                </div>
              </div>
              <Link href="/pricing" className="w-full md:w-auto">
                <button className="w-full whitespace-nowrap bg-white px-8 py-3 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-[#00E676]">
                  ACTUALIZAR PLAN
                </button>
              </Link>
            </div>
          )}

          {/* PRIMARY FOCUS: FINANCIAL METRICS */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left">
            <div className="md:col-span-2 bg-[#161B22] border border-white/5 p-8 md:p-10 flex flex-col justify-between min-h-[200px] md:min-h-[240px] relative overflow-hidden group text-left">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <Activity className="w-40 h-40" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Capital por Liquidar
                </div>
                <div className="text-5xl md:text-7xl font-black text-white tracking-tighter italic">
                  {pendienteCobro.toLocaleString("es-ES")}€
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest relative z-10">
                <Clock className="w-4 h-4 text-orange-500" /> Monitorización activa
              </div>
            </div>

            <div className="bg-[#161B22] border border-white/5 p-8 md:p-10 flex flex-col justify-between hover:border-white/20 transition-all text-left">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Cerrado (30D)
                </div>
                <div className="text-3xl md:text-4xl font-black text-[#00E676] tracking-tighter italic">
                  +{facturadoMes.toLocaleString("es-ES")}€
                </div>
              </div>
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                AEAT Handshake OK
              </div>
            </div>

            <div className="bg-[#161B22] border border-white/5 p-8 md:p-10 flex flex-col justify-between hover:border-white/20 transition-all group text-left">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                  Banking
                </div>
                <div className="text-2xl font-black text-white tracking-tighter uppercase leading-tight group-hover:text-[#00E676] transition-colors">
                  Plaid <br className="hidden md:block" />
                  Handshake
                </div>
              </div>
              <Link
                href="/settings"
                className="text-[9px] font-black text-slate-500 border-b border-white/5 pb-1 w-fit uppercase"
              >
                Gestionar Nodo
              </Link>
            </div>
          </section>

          {/* SECONDARY FOCUS: RECENT ACTIVITY */}
          <section className="space-y-8 md:space-y-10 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 gap-4">
              <div className="flex items-center gap-6">
                <div className="h-10 w-1 bg-white" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                  Registro de <br className="md:hidden" /> Emisiones.
                </h2>
              </div>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  placeholder="Buscar protocolo..."
                  className="bg-white/5 border border-white/5 pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-[#00E676] w-full md:w-64 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="group bg-[#161B22]/50 hover:bg-[#161B22] border border-white/5 p-6 md:p-8 flex flex-col lg:grid lg:grid-cols-12 items-start lg:items-center gap-6 md:gap-8 transition-all relative overflow-hidden"
                >
                  <div className="lg:col-span-2 w-full lg:w-auto flex justify-between lg:block">
                    <span className="lg:hidden text-[8px] font-black text-gray-600 uppercase tracking-widest">
                      Protocolo
                    </span>
                    <div className="text-sm font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                      {inv.invoice_number}
                    </div>
                  </div>

                  <div className="lg:col-span-5 w-full text-left">
                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1 lg:hidden">
                      Entidad Receptora
                    </div>
                    <div className="text-lg md:text-xl font-black text-white group-hover:text-[#00E676] transition-colors truncate uppercase italic">
                      {inv.client?.legal_name || "Consumidor Final"}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                       <div className="flex items-center gap-2">
                          <ShieldCheck className={cn("w-3.5 h-3.5", 
                            inv.aeat_status === 'Correcto' ? "text-[#00E676]" : 
                            inv.aeat_status === 'AceptadoConErrores' ? "text-orange-500" : "text-gray-700"
                          )} />
                          <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em]", 
                            inv.aeat_status === 'Correcto' ? "text-white" : 
                            inv.aeat_status === 'AceptadoConErrores' ? "text-orange-200" : "text-gray-600"
                          )}>
                             {inv.aeat_status || 'Pendiente de Sincronía'}
                          </span>
                       </div>
                       {inv.aeat_csv && (
                          <div className="group relative">
                            <a 
                              href={inv.aeat_csv} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[8px] font-black text-[#00E676] border border-[#00E676]/30 px-2 py-0.5 hover:bg-[#00E676] hover:text-black transition-all uppercase tracking-widest"
                            >
                               Cotejar en Sandbox AEAT
                            </a>
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-black border border-white/10 p-2 text-[7px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed shadow-2xl z-50">
                               Requiere certificado electrónico instalado en el navegador para acceder al portal de pruebas.
                            </div>
                          </div>
                       )}
                    </div>
                  </div>

                  <div className="lg:col-span-2 w-full lg:text-right flex justify-between lg:block items-baseline">
                    <span className="lg:hidden text-[8px] font-black text-gray-600 uppercase tracking-widest">
                      Cuantía Bruta
                    </span>
                    <div className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                      {Number(inv.total_amount).toLocaleString("es-ES")}€
                    </div>
                  </div>

                  <div className="lg:col-span-3 w-full flex justify-between lg:justify-end items-center gap-6">
                    <div
                      className={cn(
                        "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border",
                        inv.status === "paid"
                          ? "border-[#00E676]/20 text-[#00E676] bg-[#00E676]/5"
                          : "border-slate-800 text-slate-500",
                      )}
                    >
                      {inv.status === "rejected" ? (
                        <span className="text-[#FF3D00]">Sancionable</span>
                      ) : inv.status === "paid" ? (
                        "Liquidada"
                      ) : (
                        "En Órbita"
                      )}
                    </div>
                    <Link
                      href={`/invoices/verify/${inv.secure_token}`}
                      className="p-3 bg-white/5 text-slate-500 group-hover:bg-white group-hover:text-black transition-all flex-shrink-0 ml-auto lg:ml-0"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </div>

                  {inv.status === "rejected" && (
                    <div className="absolute top-0 right-0 h-full w-1 bg-[#FF3D00]" />
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 z-[100] bg-[#0E1117] p-10 flex flex-col gap-10 lg:hidden"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-8">
              <span className="text-xl font-bold uppercase tracking-tighter">
                Factur<span className="text-[#00E676]">AI</span>
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-8 h-8 text-slate-500" />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {[
                {
                  icon: LayoutDashboard,
                  label: "Terminal",
                  href: "/dashboard/company",
                },
                { icon: Zap, label: "Emisiones", href: "/invoices" },
                { icon: Users, label: "Entidades", href: "/clients" },
                {
                  icon: Settings,
                  label: "Infraestructura",
                  href: "/settings",
                },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 text-xl font-black uppercase tracking-tighter italic text-white"
                >
                  <item.icon className="w-6 h-6 text-[#00E676]" /> {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
