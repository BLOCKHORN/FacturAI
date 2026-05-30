'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Globe, 
  Zap, 
  Menu, 
  X, 
  Landmark,
  Shield,
  CreditCard,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Loader2
} from 'lucide-react'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSubscription = async (plan: "pyme" | "industrial") => {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0E1117] text-white selection:bg-[#00E676] selection:text-black font-sans antialiased overflow-x-hidden w-full">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 z-[100] flex w-full items-center justify-between px-6 lg:px-24 py-8 bg-[#0E1117]/80 backdrop-blur-2xl">
        <Link href="/" className="flex-shrink-0 group">
          <span className="text-xl font-bold tracking-tighter uppercase">
            Factur<span className="text-[#00E676]">AI</span>
          </span>
        </Link>
        <div className="hidden lg:flex items-center gap-16">
          <Link href="#solutions" className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors">Plataforma</Link>
          <Link href="#pricing" className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors">Precios</Link>
          <Link href="/login">
            <button className="bg-white text-black px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#00E676] transition-all rounded-none">
              Acceso Empresa
            </button>
          </Link>
        </div>
        <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-[#0E1117] pt-40 px-10 flex flex-col gap-10 lg:hidden">
            <Link href="#solutions" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black tracking-tighter uppercase italic">Tecnología</Link>
            <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black tracking-tighter uppercase italic">Precios</Link>
            <Link href="/login" className="mt-10">
               <button className="w-full bg-[#00E676] text-black py-8 font-black uppercase tracking-widest text-sm rounded-none">Entrar al Sistema</button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full">
        <section className="relative min-h-screen flex items-center pt-20 px-6 lg:px-24">
          <div className="max-w-screen-2xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial="initial" animate="animate" className="space-y-12">
              <motion.div variants={fadeIn} className="flex items-center gap-3 text-[#00E676]">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Software Homologado AEAT 2026</span>
              </motion.div>
              <motion.h1 variants={fadeIn} className="text-6xl md:text-[90px] font-black leading-[0.95] tracking-tight uppercase">
                Su negocio, <br />
                <span className="text-[#00E676]">legalmente</span> <br />
                blindado.
              </motion.h1>
              <motion.p variants={fadeIn} className="max-w-xl text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                Automatice el cumplimiento de la <span className="text-white">Ley Crea y Crece</span> y el reglamento <span className="text-white">Veri*Factu</span>. Sin tecnicismos, sin errores, sin riesgo de sanciones.
              </motion.p>
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-6">
                <Link href="/login" className="w-full sm:w-auto">
                  <button className="group w-full bg-[#00E676] text-black px-12 py-8 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white transition-all rounded-none shadow-2xl">
                    Comenzar Ahora <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }} className="hidden lg:block relative">
               <div className="bg-[#1A1F26] border border-white/10 p-12 aspect-[5/4] shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-none relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00E676]/5 to-transparent opacity-50"></div>
                  <div className="space-y-10 relative z-10">
                     <div className="flex justify-between items-center pb-6 border-b border-white/5">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 italic">Estado AEAT 2026</div>
                        <div className="px-3 py-1 bg-[#00E676]/10 border border-[#00E676]/20 text-[9px] font-black text-[#00E676] uppercase">Sincronizado</div>
                     </div>
                     <div className="space-y-2">
                        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">Facturado este mes</div>
                        <div className="text-6xl font-black tracking-tighter italic">24.500,00€</div>
                     </div>
                     <div className="pt-10 grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <div className="h-1 bg-white/5 w-full"><div className="h-full bg-[#00E676] w-3/4"></div></div>
                           <div className="text-[8px] font-black text-gray-600 uppercase">Validación Fiscal</div>
                        </div>
                        <div className="space-y-2">
                           <div className="h-1 bg-white/5 w-full"><div className="h-full bg-[#00E676] w-full"></div></div>
                           <div className="text-[8px] font-black text-gray-600 uppercase">Firma FNMT OK</div>
                        </div>
                     </div>
                  </div>
                  <div className="absolute -bottom-20 -right-20 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                     <Landmark className="w-80 h-80 text-white" />
                  </div>
               </div>
            </motion.div>
          </div>
        </section>

        <section id="solutions" className="py-32 lg:py-60 px-6 lg:px-24 bg-white text-black">
          <div className="max-w-screen-xl mx-auto">
             <div className="space-y-6 mb-32">
                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Capacidades de la Plataforma</div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">Tecnología <br /> <span className="text-gray-300 underline decoration-black/5 decoration-8 underline-offset-[-10px]">Estratégica.</span></h2>
             </div>
             <div className="grid md:grid-cols-3 gap-px bg-black/5 border border-black/5">
                {[
                  { icon: FileCheck, title: "Cumplimiento Total", desc: "Generamos sus facturas automáticamente siguiendo el estándar oficial. Sin que usted tenga que aprender leyes complejas." },
                  { icon: Shield, title: "Firma Electrónica", desc: "Validamos cada documento ante Hacienda con su certificado oficial, dándole plena validez jurídica a cada operación." },
                  { icon: CreditCard, title: "Banco Sincronizado", desc: "Conectamos con su banco en modo lectura para marcar sus facturas como pagadas al detectar el ingreso de su cliente." }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-12 lg:p-20 space-y-10 group hover:bg-black hover:text-white transition-all duration-700">
                    <item.icon className="w-12 h-12 text-black group-hover:text-[#00E676] transition-colors" />
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">{item.title}</h3>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed group-hover:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        <section id="pricing" className="py-32 lg:py-60 px-6 lg:px-24 bg-[#0E1117] text-white">
          <div className="max-w-screen-xl mx-auto space-y-32">
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-12 border-b border-white/5 pb-12">
               <h2 className="text-6xl md:text-[100px] font-black tracking-tighter leading-none italic uppercase">Niveles de <br/><span className="text-[#00E676]">Control.</span></h2>
               <div className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-500">Prueba gratuita de 14 días en planes retail</p>
               </div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-12">
              {[
                { id: "pyme", name: "Pyme / Autónomo", price: "49€", features: ["14 DÍAS PRUEBA GRATIS", "IA DESACTIVADA EN TRIAL", "50 FACTURAE / MES", "CERTIFICADO DIGITAL", "HANDSHAKE AEAT"], style: "bg-white/5" },
                { id: "industrial", name: "Empresa Pro", price: "299€", features: ["14 DÍAS PRUEBA GRATIS", "IA DESACTIVADA EN TRIAL", "FACTURACIÓN ILIMITADA", "MULTI-SOCIEDAD", "MODO PSD2 FULL"], style: "bg-white text-black shadow-2xl" },
                { id: "firm", name: "Despacho / Asesoría", price: "Socio.", features: ["FOUNDER'S CIRCLE RATE", "GESTIÓN MULTICLIENTE", "MARCA BLANCA", "SLA GARANTIZADO", "SIN TRIAL (NODO ALTA)"], style: "border-4 border-white/10" }
              ].map((plan, i) => (
                <motion.div key={i} whileHover={{ y: -20 }} className={cn("p-12 lg:p-16 flex flex-col justify-between min-h-[650px] transition-all duration-500 rounded-none shadow-2xl", plan.style)}>
                  <div className="space-y-12">
                    <div className="text-[12px] font-black uppercase tracking-[0.8em] opacity-40">Tier {plan.name}</div>
                    <div className="space-y-2">
                       <span className="text-7xl lg:text-9xl font-black tracking-tighter italic">{plan.price}</span>
                       <div className="text-[9px] font-black opacity-30 tracking-[0.3em] uppercase">Mensualidad Base (+IVA)</div>
                    </div>
                    <div className="h-px bg-current opacity-10 w-full"></div>
                    <ul className="space-y-6">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4 text-[#00E676]" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {plan.id === 'firm' ? (
                    <Link href="/partners/founders" className="pt-12">
                      <button className="w-full py-8 text-[11px] font-black uppercase tracking-[0.4em] transition-all rounded-none border border-current hover:bg-current hover:invert">
                        SABER MÁS
                      </button>
                    </Link>
                  ) : (
                    <button 
                      onClick={() => handleSubscription(plan.id as any)}
                      disabled={loadingPlan !== null}
                      className={cn(
                        "mt-12 w-full py-8 text-[11px] font-black uppercase tracking-[0.4em] transition-all rounded-none",
                        plan.id === 'industrial' ? 'bg-black text-white hover:bg-[#00E676] hover:text-black' : 'border border-current hover:bg-current hover:invert'
                      )}
                    >
                      {loadingPlan === plan.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'INICIAR 14 DÍAS GRATIS'}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-40 lg:py-72 px-6 lg:px-24 bg-white text-black text-center border-t-8 border-black">
           <div className="max-w-4xl mx-auto space-y-16">
              <h2 className="text-7xl lg:text-[180px] font-black tracking-[-0.06em] leading-[0.75] uppercase italic text-black">CERO <br /> RIESGO.</h2>
              <Link href="/login">
                <button className="bg-black text-white px-20 lg:px-40 py-12 text-xl lg:text-3xl font-black uppercase tracking-[0.5em] hover:bg-[#00E676] hover:text-black transition-all rounded-none shadow-2xl">INICIAR PLATAFORMA</button>
              </Link>
           </div>
        </section>
      </main>

      <footer className="px-6 lg:px-24 py-32 bg-black border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24">
          <div className="space-y-10">
            <span className="text-xl font-black tracking-[0.2em] uppercase">Factur<span className="text-[#00E676]">AI</span></span>
            <p className="text-[10px] font-bold text-gray-600 uppercase leading-[2.5] tracking-[0.4em]">Infraestructura fiscal crítica para la <br className="hidden lg:block" /> nueva economía digital española.</p>
          </div>
          {[
            { title: "SISTEMA", links: ["FACTURACIÓN ELECTRÓNICA", "BANCA DIRECTA PSD2", "CUMPLIMIENTO AEAT"] },
            { title: "LEGAL", links: ["LEY CREA Y CRECE", "REGLAMENTO VERIFACTU", "PRIVACIDAD FINANCIERA"] },
            { title: "SOPORTE", links: ["DOCUMENTACIÓN", "ESTADO DEL SERVICIO", "CONTACTO EMPRESAS"] }
          ].map((col, i) => (
            <div key={i} className="space-y-10">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.6em]">{col.title}</h4>
              <ul className="space-y-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                {col.links.map((link, j) => (
                  <li key={j}><Link href="#" className="hover:text-[#00E676] transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-screen-2xl mx-auto mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 opacity-50">
           <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">© 2026 FacturAI Protocol // All Systems Operational</div>
           <div className="flex gap-12 items-center grayscale">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/Logotipo_de_la_Agencia_Tributaria.svg" className="h-6" alt="AEAT" />
              <div className="text-[10px] font-black uppercase text-white">PCI DSS</div>
              <div className="text-[10px] font-black uppercase text-white">PSD2 Ready</div>
           </div>
        </div>
      </footer>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
