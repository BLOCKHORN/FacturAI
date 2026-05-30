"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ShieldAlert,
  BarChart3,
  Search,
  Plus,
  ShieldCheck,
  Clock,
  ExternalLink,
  Settings,
  Menu,
  X,
  ChevronRight,
  LayoutGrid,
  Activity,
  ArrowUpRight,
  Loader2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/utils/cn";

export default function FirmDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [firm, setFirm] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Client Deployment State
  const [showAddClient, setShowAddClient] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    async function loadFirmData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      setFirm({
        name: "Garrido & Asociados",
        license_usage: 42,
        max_licenses: 100,
      });

      setClients([
        { id: "1", name: "Construcciones Paco S.L.", cif: "B12345678", last: "2h", risk: "low", pending: 0 },
        { id: "2", name: "Restaurante El Puerto", cif: "B99988877", last: "5d", risk: "critical", pending: 12 },
        { id: "3", name: "Marketing Digital S.A.", cif: "A44556633", last: "1h", risk: "low", pending: 0 },
        { id: "4", name: "Talleres García", cif: "B11223344", last: "1d", risk: "medium", pending: 3 },
      ]);

      setLoading(false);
    }
    loadFirmData();
  }, []);

  const handleInviteClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    // Simulación de despliegue de infraestructura
    setTimeout(() => {
      alert(`INFRAESTRUCTURA: Terminal activada para ${inviteEmail}. Asiento de licencia reservado.`);
      setInviting(false);
      setShowAddClient(false);
      setInviteEmail("");
    }, 1500);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0E1117] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-[#00E676] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0E1117] text-slate-200 antialiased font-sans selection:bg-[#00E676] selection:text-black overflow-x-hidden w-full">
      
      <aside className="hidden lg:flex w-20 flex-col border-r border-white/5 bg-[#0A0C10] fixed h-full z-50 items-center py-8 gap-12">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-[#00E676] flex items-center justify-center rounded-none font-black text-black text-lg">F</div>
        </Link>
        <nav className="flex flex-col gap-8">
          {[
            { icon: LayoutGrid, active: true },
            { icon: Users },
            { icon: ShieldAlert },
            { icon: Settings },
          ].map((item, i) => (
            <div key={i} className={cn(
              "p-3 cursor-pointer transition-all border-l-2",
              item.active ? "border-[#00E676] text-[#00E676]" : "border-transparent text-slate-600 hover:text-white"
            )}>
              <item.icon className="w-6 h-6" />
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 lg:pl-20 w-full min-w-0">
        
        <header className="px-6 lg:px-16 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#0E1117]">
           <div className="flex items-center gap-6">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-white/5 border border-white/10"><Menu className="w-5 h-5 text-slate-400" /></button>
              <div>
                <h1 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Panel del Despacho</h1>
                <div className="text-xl md:text-2xl font-black text-white tracking-tight italic uppercase">{firm.name}</div>
              </div>
           </div>
           <button 
             onClick={() => setShowAddClient(true)}
             className="w-full md:w-auto bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#00E676] transition-all flex items-center justify-center gap-3 shadow-2xl"
           >
              <Plus className="w-4 h-4" /> Nuevo Cliente
           </button>
        </header>

        <main className="px-6 lg:px-16 py-8 space-y-12 md:space-y-16 max-w-full overflow-x-hidden">
          
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
             <div className="md:col-span-2 bg-[#161B22] border border-white/5 p-8 md:p-10 flex flex-col justify-between min-h-[200px] md:min-h-[240px] hover:border-[#00E676]/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><Activity className="w-40 h-40" /></div>
                <div className="space-y-2 relative z-10">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Estado de la Flota</div>
                   <div className="text-4xl md:text-5xl font-black text-white tracking-tighter italic leading-none">02 Riesgos Críticos</div>
                </div>
                <div className="flex items-center gap-4 text-[10px] md:text-xs font-bold text-[#FF3D00] uppercase tracking-widest relative z-10">
                   <ShieldAlert className="w-4 h-4" /> Acción inmediata requerida
                </div>
             </div>

             <div className="bg-[#161B22] border border-white/5 p-8 md:p-10 flex flex-col justify-between hover:border-white/20 transition-all">
                <div className="space-y-1">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Clientes Activos</div>
                   <div className="text-3xl md:text-4xl font-black text-white tracking-tighter">{clients.length}</div>
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">{firm.license_usage}/{firm.max_licenses} Licencias</div>
             </div>

             <div className="bg-[#161B22] border border-white/5 p-8 md:p-10 flex flex-col justify-between hover:border-white/20 transition-all group">
                <div className="space-y-1">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Nodo de Red</div>
                   <div className="text-3xl font-black text-white tracking-tighter uppercase leading-tight group-hover:text-[#00E676] transition-colors italic">Suministro <br/> Industrial</div>
                </div>
                <Link href="/pricing/firm" className="text-[9px] font-black text-slate-500 border-b border-white/5 pb-1 w-fit uppercase hover:text-white transition-colors">Ver Tarifas de Volumen</Link>
             </div>
          </section>

          <section className="space-y-6 md:space-y-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Gestión de Entidades</h2>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input type="text" placeholder="Buscar..." className="bg-white/5 border border-white/5 pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-[#00E676] w-full md:w-64 transition-all" />
                </div>
             </div>

             <div className="space-y-4">
                {clients.map((client) => (
                   <div key={client.id} className="group bg-[#161B22]/50 hover:bg-[#161B22] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8 transition-all relative overflow-hidden">
                      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                         <div className={cn(
                           "w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center text-lg font-black italic",
                           client.risk === 'critical' ? "bg-[#FF3D00]/10 text-[#FF3D00]" : "bg-white/5 text-slate-400"
                         )}>
                            {client.name.charAt(0)}
                         </div>
                         <div className="space-y-1 min-w-0">
                            <div className="text-base md:text-lg font-black text-white group-hover:text-[#00E676] transition-colors truncate uppercase italic">{client.name}</div>
                            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{client.cif}</div>
                         </div>
                      </div>

                      <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-12 w-full md:w-auto justify-between md:justify-end">
                         <div className="text-left md:text-right">
                            <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Actividad</div>
                            <div className="text-[10px] font-mono font-bold text-slate-400">Hace {client.last}</div>
                         </div>
                         
                         <div className={cn(
                            "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border",
                            client.risk === 'low' ? "border-[#00E676]/20 text-[#00E676] bg-[#00E676]/5" : "border-[#FF3D00]/30 text-[#FF3D00] bg-[#FF3D00]/5 animate-pulse"
                         )}>
                            {client.risk === 'low' ? 'Sincronizado' : 'Fallo Plazo'}
                         </div>

                         <Link href={`/dashboard/firm/client/${client.id}`} className="p-3 bg-white/5 text-slate-600 group-hover:bg-white group-hover:text-black transition-all flex-shrink-0 ml-auto md:ml-0">
                            <ChevronRight className="w-5 h-5" />
                         </Link>
                      </div>
                   </div>
                ))}
             </div>
          </section>
        </main>

        <footer className="px-16 py-12 border-t border-white/5 opacity-40">
           <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.4em] text-slate-600">
              <span>FacturAI Node v2.4.0</span>
              <div className="flex gap-8">
                 <span>PCI DSS Ready</span>
                 <span>AEAT Handshake Active</span>
              </div>
           </div>
        </footer>
      </div>

      {/* ADD CLIENT MODAL: INFRASTRUCTURE DEPLOYMENT STYLE */}
      <AnimatePresence>
        {showAddClient && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-0">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddClient(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-[#0E1117] border border-white/10 p-10 md:p-14 space-y-12 shadow-[0_0_100px_rgba(0,0,0,1)]">
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <div className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.4em]">Despliegue de Licencia</div>
                      <div className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase">{firm.max_licenses - firm.license_usage} Slots Libres</div>
                   </div>
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Activar Terminal de Cliente.</h3>
                   <p className="text-xs font-bold text-gray-600 uppercase tracking-widest leading-relaxed">
                     Se enviará una invitación segura para que el cliente configure su entorno (Plaid + FNMT) automáticamente.
                   </p>
                </div>

                <form onSubmit={handleInviteClient} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Email del Receptor</label>
                      <input 
                        required
                        type="email" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="paco@empresa.com"
                        className="w-full bg-white/5 border border-white/10 px-6 py-5 text-sm font-bold focus:border-[#00E676] outline-none transition-all placeholder:opacity-20 text-white uppercase tracking-widest"
                      />
                   </div>

                   <button 
                    disabled={inviting}
                    className="w-full bg-white text-black py-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-[#00E676] transition-all flex items-center justify-center gap-4 group"
                   >
                      {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
                      {inviting ? 'DESPLEGANDO...' : 'ENVIAR INVITACIÓN'}
                   </button>
                </form>

                <div className="pt-8 border-t border-white/5 flex flex-col gap-4 text-center">
                   <div className="text-[8px] font-bold text-slate-700 uppercase tracking-widest leading-relaxed">
                      Esta operación consume 1 "Asiento de Auditoría" <br/> de su plan mensual contratado.
                   </div>
                   <button onClick={() => setShowAddClient(false)} className="text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-all">Cancelar Despliegue</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
