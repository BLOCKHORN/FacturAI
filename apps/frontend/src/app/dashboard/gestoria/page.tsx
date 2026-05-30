'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download,
  Eye,
  BarChart3,
  Building2,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export default function GestoriaDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData?.role !== 'gestoria') {
        window.location.href = '/dashboard/company'
        return
      }

      const { data: clientsData } = await supabase
        .from('profiles')
        .select('*, invoices(id, status, status_updated_at)')
        .eq('gestoria_id', user.id)

      setProfile(profileData)
      setClients(clientsData || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const getRiskStatus = (invoices: any[]) => {
    const criticalInvoices = invoices?.filter(inv => {
      if (inv.status === 'accepted' || inv.status === 'paid' || inv.status === 'rejected') return false
      const hoursSinceUpdate = (Date.now() - new Date(inv.status_updated_at).getTime()) / (1000 * 60 * 60)
      return hoursSinceUpdate > 48
    })
    
    if (criticalInvoices?.length > 5) return { color: 'text-[#FF3D00]', bg: 'bg-[#FF3D00]/10', border: 'border-[#FF3D00]/20', label: 'CRÍTICO' }
    if (criticalInvoices?.length > 0) return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'ALERTA' }
    return { color: 'text-[#00E676]', bg: 'bg-[#00E676]/10', border: 'border-[#00E676]/20', label: 'ESTABLE' }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0E1117] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#00E676]/20 border-t-[#00E676] rounded-none animate-spin"></div>
        <div className="text-[#00E676] font-black uppercase tracking-[0.4em] text-[10px]">Verificando Cartera Gestoría...</div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0E1117] text-white font-sans selection:bg-[#00E676] selection:text-black">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="p-8">
           <Link href="/dashboard/gestoria" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter italic">FACTURA<span className="text-[#00E676]">AI</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { icon: Users, label: "Clientes", active: true },
            { icon: BarChart3, label: "Reportes" },
            { icon: FileText, label: "Exportaciones" },
            { icon: Building2, label: "Mi Gestoría" }
          ].map((item, i) => (
            <button key={i} className={cn(
              "flex w-full items-center gap-3 px-4 py-3 rounded-none text-[11px] font-black uppercase tracking-widest transition-all",
              item.active ? "bg-[#00E676] text-black shadow-[0_0_20px_rgba(0,230,118,0.2)]" : "text-gray-500 hover:text-white hover:bg-white/5"
            )}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6">
           <div className="bg-white/5 border border-white/10 rounded-none p-4 space-y-3">
              <div className="flex items-center gap-2 text-[9px] font-black text-[#00E676] uppercase tracking-widest">
                 <ShieldCheck className="w-3 h-3" />
                 Compliance 2026: OK
              </div>
              <div className="text-[10px] font-medium text-gray-500 leading-tight">
                 Monitorizando 4 empresas vinculadas.
              </div>
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="border-b border-white/5 bg-[#0E1117]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-40">
          <div className="flex-1 max-w-xl relative hidden md:block">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
             <input 
              type="text" 
              placeholder="BUSCAR EMPRESA O CIF..." 
              className="w-full bg-white/5 border border-white/10 rounded-none py-2.5 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:border-[#00E676] outline-none transition-colors"
             />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
               <div className="text-[8px] font-black text-[#00E676] uppercase tracking-widest">PANEL GESTORÍA</div>
               <div className="text-xs font-black italic">{profile?.company_name?.toUpperCase() || 'GESTORÍA PROFESIONAL'}</div>
            </div>
            <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-xs">
              {profile?.company_name?.[0] || 'G'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {/* RISK MONITOR - REDESIGNED */}
          <section className="bg-white/5 border border-white/10 rounded-none p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-[#00E676]/5 blur-3xl rounded-none"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
                  MONITOR DE <br />
                  <span className="text-[#00E676]">RIESGO COLECTIVO</span>
                </h2>
                <p className="text-xs text-gray-400 font-medium max-w-sm uppercase tracking-widest">
                  Control en tiempo real del cumplimiento de los 4 días legales en toda su cartera de clientes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                {clients?.map((client, i) => {
                  const status = getRiskStatus(client.invoices)
                  return (
                    <motion.div 
                      key={client.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "h-12 w-12 rounded-none flex items-center justify-center border-2 transition-all cursor-help",
                        status.color, status.bg, status.border
                      )}
                      title={`${client.company_name}: ${status.label}`}
                    >
                      <Building2 className="w-5 h-5" />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* CLIENT LIST */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">CARTERA DE EMPRESAS</h2>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="gap-2 rounded-none">
                    <Filter className="w-3 h-3" /> FILTRAR
                 </Button>
                 <Button variant="secondary" size="sm" className="gap-2 rounded-none">
                    <Download className="w-3 h-3" /> EXPORTACIÓN SAGE/A3
                 </Button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-none overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] border-b border-white/5">
                  <tr>
                    <th className="px-8 py-6">Empresa</th>
                    <th className="px-8 py-6">Identificación</th>
                    <th className="px-8 py-6">Volumen Mes</th>
                    <th className="px-8 py-6 text-center">Estatus Legal</th>
                    <th className="px-8 py-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {clients && clients.length > 0 ? (
                      clients.map((client, i) => {
                        const status = getRiskStatus(client.invoices)
                        return (
                          <motion.tr 
                            key={client.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-white/5 transition-colors group"
                          >
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-none bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-[#00E676] transition-colors border border-white/5">
                                     <Building2 className="w-5 h-5" />
                                  </div>
                                  <div className="font-black text-sm text-white">{client.company_name}</div>
                               </div>
                            </td>
                            <td className="px-8 py-6 font-mono text-[10px] text-gray-500 tracking-widest">{client.cif_nif}</td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <FileText className="w-3 h-3 text-gray-600" />
                                  <span className="font-black text-white">{client.invoices?.length || 0}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex justify-center">
                                <div className={cn(
                                  "px-3 py-1 rounded-none border text-[8px] font-black tracking-widest flex items-center gap-1.5",
                                  status.color, status.bg, status.border
                                )}>
                                  <div className={cn("w-1.5 h-1.5 rounded-none", status.color.replace('text', 'bg'))}></div>
                                  {status.label}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-none">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-none">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center text-gray-600 font-black uppercase tracking-[0.5em] text-xs">No hay empresas vinculadas a su cartera</td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
