"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ArrowRight, 
  Zap,
  Briefcase,
  Shield,
  Landmark,
  Loader2
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function FoundersCirclePage() {
  const [clients, setClients] = useState(25);
  const [loadingPayment, setLoadingPayment] = useState(false);
  
  // LÓGICA DE NEGOCIO REVISADA
  const retailMonthly = 49;
  const legacyRate = 20; // Bloqueado para fundadores (vs 35€ normal)
  const profitPerClient = retailMonthly - legacyRate; // 29€ de beneficio para el gestor
  
  const monthlyProfit = clients * profitPerClient;
  const annualProfit = monthlyProfit * 12;

  const handleFounderSignup = async () => {
    setLoadingPayment(true);
    try {
      const res = await fetch("/api/billing/create-founder-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Error al iniciar el checkout");
      }
    } catch (err: any) {
      alert(`ERROR: ${err.message}`);
      setLoadingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#0E1117] selection:bg-[#00E676] selection:text-black font-sans antialiased overflow-x-hidden w-full">
      
      {/* NAVIGATION: LIGHT FINTECH */}
      <nav className="fixed top-0 z-[100] w-full flex items-center justify-between px-6 lg:px-24 py-8 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <Link href="/" className="flex items-center gap-4 group">
          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Inicio</span>
        </Link>
        <div className="flex items-center gap-4">
           <span className="text-sm font-black tracking-tighter uppercase italic border-r border-gray-200 pr-4">Factur<span className="text-[#00E676]">AI</span> Partners</span>
           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1">Programa Cerrado</span>
        </div>
      </nav>

      <main className="w-full max-w-screen-2xl mx-auto px-6 lg:px-24 pt-48 pb-60">
        
        {/* HERO SECTION: EDITORIAL STYLE */}
        <section className="grid lg:grid-cols-12 gap-24 items-center mb-60">
          <div className="lg:col-span-7 space-y-12 text-center lg:text-left">
            <div className="space-y-6">
               <h1 className="text-6xl md:text-[110px] font-black tracking-tight leading-[0.9] uppercase italic text-black">
                 Tu despacho, <br />
                 <span className="text-gray-300">en piloto</span> <br />
                 automático.
               </h1>
               <p className="max-w-xl text-lg md:text-xl text-gray-500 font-medium leading-relaxed mx-auto lg:mx-0">
                 Buscamos a los 5 primeros despachos estratégicos para desplegar el nodo FacturAI. A cambio, bloqueamos tu margen de beneficio para siempre.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
               <div className="space-y-4 border-l-2 border-[#00E676] pl-8">
                  <div className="text-sm font-black uppercase tracking-widest italic text-left">Tarifa Legacy 20€</div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest leading-loose text-left">
                    Tu primer tramo de clientes queda anclado a 20€/mes de por vida. Sin subidas, sin letra pequeña.
                  </p>
               </div>
               <div className="space-y-4 border-l-2 border-gray-200 pl-8">
                  <div className="text-sm font-black uppercase tracking-widest italic text-gray-400 text-left">Despliegue 0€</div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest leading-loose text-left">
                    Inyecta hasta 10 clientes inmediatamente. Nosotros cubrimos el coste los primeros 90 días.
                  </p>
               </div>
            </div>
          </div>

          {/* ROI SIMULATOR: MINIMALIST CARD */}
          <div className="lg:col-span-5 w-full">
             <div className="bg-white p-10 lg:p-16 space-y-12 shadow-[0_60px_100px_rgba(0,0,0,0.08)] border border-gray-100 rounded-none relative overflow-hidden">
                <div className="space-y-2">
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Business Opportunity</div>
                   <h2 className="text-4xl font-black text-black italic tracking-tighter uppercase leading-none">Simulador de Margen.</h2>
                </div>

                <div className="space-y-12">
                   <div className="space-y-6">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nº Clientes en Cartera</span>
                         <span className="text-5xl font-black text-black italic tracking-tighter">{clients}</span>
                      </div>
                      <input 
                        type="range" min="1" max="50" 
                        value={clients} onChange={(e) => setClients(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-none appearance-none cursor-pointer accent-[#00E676]"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-8 py-10 border-y border-gray-50">
                      <div className="space-y-1 text-center">
                         <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tu Beneficio Mes</div>
                         <div className="text-4xl font-black text-black italic">+{monthlyProfit}€</div>
                      </div>
                      <div className="space-y-1 text-center">
                         <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Margen Anual</div>
                         <div className="text-4xl font-black text-[#00E676] italic">+{annualProfit.toLocaleString("es-ES")}€</div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <button 
                        onClick={handleFounderSignup}
                        disabled={loadingPayment}
                        className="w-full bg-black text-white py-8 text-xs font-black uppercase tracking-[0.3em] hover:bg-[#00E676] hover:text-black transition-all rounded-none shadow-2xl flex items-center justify-center gap-4 group disabled:opacity-50"
                      >
                         {loadingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
                         {loadingPayment ? 'PREPARANDO NODO...' : 'Solicitar Plaza de Fundador'}
                      </button>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">Inversión inicial de alta: 499€ (Pago único)</p>
                   </div>
                </div>

                <div className="text-center pt-4">
                   <div className="text-[10px] font-black text-[#FF3D00] uppercase tracking-[0.3em] animate-pulse text-center">Solo quedan 3 plazas disponibles</div>
                </div>
             </div>
          </div>
        </section>

        {/* VALUE PROPOSITION: BENTO STYLE */}
        <section className="grid md:grid-cols-3 gap-px bg-gray-100 border border-gray-100 shadow-2xl">
           <div className="bg-white p-12 lg:p-20 space-y-8 group hover:bg-[#00E676] transition-all duration-700">
              <Zap className="w-12 h-12 text-black" />
              <div className="space-y-4 text-left">
                 <h4 className="text-2xl font-black uppercase italic tracking-tighter text-left">Adiós al Trabajo Manual</h4>
                 <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest leading-loose text-left group-hover:text-black">
                   Elimina las 40h mensuales de punteo de facturas. La IA procesa y concilia con el banco en tiempo real.
                 </p>
              </div>
           </div>

           <div className="bg-white p-12 lg:p-20 space-y-8 group hover:bg-black hover:text-white transition-all duration-700">
              <Briefcase className="w-12 h-12 text-black group-hover:text-[#00E676]" />
              <div className="space-y-4 text-left">
                 <h4 className="text-2xl font-black uppercase italic tracking-tighter text-left">Reduce Costes de Personal</h4>
                 <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest leading-loose text-left group-hover:text-gray-400">
                   FacturAI sustituye la necesidad de auxiliares para la entrada de datos. El sistema es tu equipo de soporte más eficiente.
                 </p>
              </div>
           </div>

           <div className="bg-white p-12 lg:p-20 space-y-8 group hover:bg-[#FF3D00] transition-all duration-700">
              <Shield className="w-12 h-12 text-black group-hover:text-white" />
              <div className="space-y-4 text-left">
                 <h4 className="text-2xl font-black uppercase italic tracking-tighter text-left group-hover:text-white text-left">Blindaje AEAT 100%</h4>
                 <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest leading-loose text-left group-hover:text-white/80">
                   Tranquilidad absoluta ante Veri*Factu. Cumplimos los plazos legales de reporte de forma automática por ti.
                 </p>
              </div>
           </div>
        </section>

      </main>

      {/* FOOTER: MINIMAL & CORPORATE */}
      <footer className="py-40 bg-white text-black text-center border-t border-gray-100">
         <div className="max-w-4xl mx-auto space-y-12 px-6">
            <h2 className="text-7xl md:text-[140px] font-black tracking-tighter leading-[0.75] uppercase italic">RESERVA TU <br/> NODO.</h2>
            <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale items-center pt-10">
               <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/Logotipo_de_la_Agencia_Tributaria.svg" className="h-8" alt="AEAT" />
               <Landmark className="w-8 h-8" />
               <span className="text-xl font-black tracking-widest italic">PLAID</span>
               <span className="text-xl font-black tracking-widest uppercase">Sage</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
