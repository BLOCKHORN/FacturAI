"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  FileDown,
  Clock,
  ArrowUpRight,
  Landmark,
  FileText,
  Search,
  ExternalLink,
  Activity,
  History,
  TrendingUp,
  FileCode,
  BarChart3,
  Loader2,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function ClientAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState("T2");

  const handleExport = (software: string) => {
    setExporting(true);
    setTimeout(() => {
      alert(`PROTOCOLO: Exportación generada para ${software}. Lote ${selectedQuarter} listo.`);
      setExporting(false);
      setShowExportModal(false);
    }, 1500);
  };

  useEffect(() => {
    async function loadData() {
      const mockClients: Record<string, any> = {
        "1": { name: "Construcciones Paco S.L.", cif: "B12345678", total: "54.450€", risk: 'low' },
        "2": { name: "Restaurante El Puerto", cif: "B99988877", total: "13.420€", risk: 'critical' },
        "3": { name: "Marketing Digital S.A.", cif: "A44556633", total: "10.285€", risk: 'low' },
        "4": { name: "Talleres García", cif: "B11223344", total: "6.776€", risk: 'medium' },
      };
      setClient(mockClients[id] || mockClients["1"]);
      
      setInvoices([
        { num: "INV-2026-042", date: "22/05/2026", total: "1.210,00€", status: "paid", method: "Plaid" },
        { num: "INV-2026-041", date: "15/05/2026", total: "450,00€", status: "sent", method: "Manual" },
        { num: "INV-2026-039", date: "02/05/2026", total: "3.200,00€", status: "paid", method: "Plaid" },
      ]);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0E1117] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0E1117] text-slate-200 antialiased font-sans overflow-x-hidden w-full pb-20">
      
      {/* AUDIT HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#0A0C10]/95 backdrop-blur-xl border-b border-white/5 px-6 lg:px-12 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="p-2 bg-white/5 hover:bg-white hover:text-black transition-all">
               <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <div>
               <div className="text-[9px] font-black text-[#00E676] uppercase tracking-widest mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> Terminal de Auditoría v2.4
               </div>
               <div className="text-xl font-black text-white uppercase italic tracking-tighter">{client.name}</div>
            </div>
         </div>

         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex bg-white/5 p-1 rounded-none border border-white/5">
               {['T1', 'T2', 'T3', 'T4'].map(q => (
                  <button 
                    key={q}
                    onClick={() => setSelectedQuarter(q)}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black transition-all",
                      selectedQuarter === q ? "bg-white text-black" : "text-slate-500 hover:text-white"
                    )}
                  >
                    {q}
                  </button>
               ))}
            </div>
            <button 
               onClick={() => setShowExportModal(true)}
               className="bg-[#00E676] text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl flex items-center gap-3"
            >
               <Download className="w-4 h-4" /> Exportar Periodo
            </button>
         </div>
      </header>

      <main className="pt-48 md:pt-32 p-6 lg:p-12 space-y-16 max-w-screen-2xl mx-auto">
         
         {/* DASHBOARD METRICS */}
         <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
            <div className="bg-black p-10 space-y-6">
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Volumen Periodo ({selectedQuarter})</div>
               <div className="text-6xl font-black text-white tracking-tighter italic">{client.total}</div>
               <div className="h-1 w-16 bg-[#00E676]" />
            </div>
            <div className="bg-black p-10 flex flex-col justify-between">
               <div className="space-y-4">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Salud Veri*Factu</div>
                  <div className="text-2xl font-black text-[#00E676] italic">SINCRO TOTAL</div>
               </div>
               <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                  Cero discrepancias detectadas <br/> en el trimestre actual.
               </div>
            </div>
            <div className="bg-black p-10 flex flex-col justify-between">
               <div className="space-y-4">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Histórico Global</div>
                  <div className="text-2xl font-black text-white italic tracking-tighter">142 FACTURAS</div>
               </div>
               <button className="text-[9px] font-black text-slate-400 border-b border-white/10 pb-1 w-fit uppercase hover:text-white transition-colors">Ver Libro Completo</button>
            </div>
         </section>

         {/* ACTIVITY LEDGER */}
         <section className="space-y-8">
            <div className="flex items-center gap-6 border-b border-white/5 pb-8">
               <div className="h-10 w-2 bg-white" />
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Libro de Registro.</h2>
            </div>

            <div className="bg-black border border-white/5 overflow-hidden">
               <div className="hidden lg:grid grid-cols-12 gap-8 px-10 py-6 bg-white/[0.03] text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] border-b border-white/5">
                  <div className="col-span-2">ID Protocolo</div>
                  <div className="col-span-2">Fecha</div>
                  <div className="col-span-3">Importe Bruto</div>
                  <div className="col-span-3">Pulsación Bancaria</div>
                  <div className="col-span-2 text-right">Archivos</div>
               </div>

               <div className="divide-y divide-white/5">
                  {invoices.map((inv, i) => (
                     <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 px-8 md:px-10 py-10 md:py-14 items-center hover:bg-white/[0.02] transition-all group">
                        <div className="col-span-2 text-sm font-mono font-bold text-slate-400 group-hover:text-white">{inv.num}</div>
                        <div className="col-span-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{inv.date}</div>
                        <div className="col-span-3 text-3xl font-black text-white tracking-tighter">{inv.total}</div>
                        <div className="col-span-3">
                           <div className={cn(
                              "inline-flex items-center gap-3 px-4 py-2 border text-[9px] font-black uppercase tracking-widest",
                              inv.status === 'paid' ? "border-[#00E676]/20 text-[#00E676] bg-[#00E676]/5" : "border-slate-800 text-slate-600"
                           )}>
                              <div className={cn("w-1 h-1 rounded-full", inv.status === 'paid' ? "bg-[#00E676]" : "bg-slate-700")} />
                              {inv.status === 'paid' ? 'Conciliado Plaid' : 'Esperando Pago'}
                           </div>
                        </div>
                        <div className="col-span-2 flex justify-end gap-3">
                           <button className="p-3 bg-white/5 hover:bg-white hover:text-black transition-all"><FileText className="w-4 h-4" /></button>
                           <button className="p-3 bg-white/5 hover:bg-white hover:text-black transition-all"><ExternalLink className="w-4 h-4" /></button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>
      </main>

      {/* EXPORT MODAL: VISUAL SOFTWARE IDENTIFICATION */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExportModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl space-y-12 border border-white/10 bg-[#0E1117] p-10 md:p-20 shadow-[0_0_100px_rgba(0,0,0,1)]">
              
              <div className="space-y-4">
                <div className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.6em]">Consolidación de Periodo // {selectedQuarter} 2026</div>
                <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">Exportar para Contabilidad.</h3>
                <p className="text-xs font-bold leading-relaxed tracking-widest text-gray-500 uppercase max-w-2xl">Elija el nodo de destino para la integración de asientos contables. Generamos archivos optimizados para cada motor.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* A3 Logo Style */}
                <button onClick={() => handleExport("A3 ECO")} className="group bg-white p-12 flex flex-col items-center gap-8 text-center transition-all hover:bg-[#E20613]">
                   <img src="https://logo.clearbit.com/wolterskluwer.com" className="h-12 grayscale group-hover:grayscale-0 group-hover:invert transition-all" alt="A3" />
                   <div className="space-y-2">
                      <div className="text-xl font-black tracking-tighter text-black group-hover:text-white uppercase italic">A3 <span className="font-light">eco</span></div>
                      <p className="text-[8px] font-bold text-gray-500 uppercase group-hover:text-white/80">Lote Facturae ZIP + Metadatos</p>
                   </div>
                </button>

                {/* SAGE Logo Style */}
                <button onClick={() => handleExport("SAGE")} className="group bg-white p-12 flex flex-col items-center gap-8 text-center transition-all hover:bg-[#007E3A]">
                   <img src="https://logo.clearbit.com/sage.com" className="h-12 grayscale group-hover:grayscale-0 group-hover:invert transition-all" alt="Sage" />
                   <div className="space-y-2">
                      <div className="text-xl font-black tracking-tighter text-black group-hover:text-white uppercase italic">SAGE <span className="font-light">50 / 200</span></div>
                      <p className="text-[8px] font-bold text-gray-500 uppercase group-hover:text-white/80">Importación Directa XML 3.2.2</p>
                   </div>
                </button>

                {/* CONTAPLUS / UNIVERSAL Style */}
                <button onClick={() => handleExport("UNIVERSAL")} className="group bg-white/5 border border-white/10 p-12 flex flex-col items-center gap-8 text-center transition-all hover:bg-white hover:text-black">
                   <div className="text-4xl font-black tracking-tighter text-white group-hover:text-black italic uppercase">CSV</div>
                   <div className="space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-black">Libro Técnico</div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase group-hover:text-black/80">Punto neutro para Contaplus / Excel</p>
                   </div>
                </button>
              </div>

              {exporting && (
                <div className="flex animate-pulse items-center justify-center gap-4 text-[#00E676] font-black text-[10px] uppercase tracking-widest">
                  <Loader2 className="h-4 w-4 animate-spin" /> Procesando rastro de auditoría...
                </div>
              )}

              <div className="flex justify-between items-center border-t border-white/5 pt-10">
                <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest italic">Protocolo de seguridad FacturAI Vault activado</div>
                <button onClick={() => setShowExportModal(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-[#FF3D00] transition-colors">Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
