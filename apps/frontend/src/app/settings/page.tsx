'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlaidLink } from 'react-plaid-link'
import { 
  ChevronLeft, 
  Building2, 
  ShieldCheck, 
  Upload, 
  Save, 
  AlertTriangle,
  Fingerprint,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Globe,
  Lock,
  ExternalLink,
  Receipt,
  CreditCard,
  Shield
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/utils/cn'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Plaid State
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const [profile, setProfile] = useState({
    company_name: '',
    cif_nif: '',
    fiscal_address: '',
    zip_code: '',
    city: '',
    province: '',
    phone: '',
    email: '',
    tax_regime: '01',
    default_series: '2026-',
    logo_url: '',
    certificate_status: 'pending',
    bank_name: '',
    iban: '',
    swift_bic: ''
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (data) {
        const safeData = Object.fromEntries(
          Object.entries(data).map(([key, val]) => [key, val === null ? '' : val])
        )
        setProfile({ ...profile, ...safeData })
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err.message)
    } finally {
      setLoading(false)
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No session')

      let finalLogoUrl = profile.logo_url
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${user.id}-logo.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { upsert: true })
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName)
          finalLogoUrl = publicUrl
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: profile.company_name,
          cif_nif: profile.cif_nif,
          fiscal_address: profile.fiscal_address,
          zip_code: profile.zip_code,
          city: profile.city,
          province: profile.province,
          phone: profile.phone,
          email: profile.email,
          tax_regime: profile.tax_regime,
          default_series: profile.default_series,
          logo_url: finalLogoUrl,
          bank_name: profile.bank_name,
          iban: profile.iban,
          swift_bic: profile.swift_bic,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // --- PLAID LOGIC ---
  
  const initPlaidLink = async () => {
    setConnecting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/bank/create-link-token', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Servidor Error: ${text.substring(0, 30)}`);
      }

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Plaid Init Failed')
      
      setLinkToken(result.link_token)
    } catch (err: any) {
      alert(`CONEXIÓN BANCARIA: ${err.message}`)
      setConnecting(false)
    }
  }

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await fetch('/api/bank/exchange-token', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ 
            publicToken,
            institutionId: metadata.institution?.institution_id,
            institutionName: metadata.institution?.name
          })
        })
        alert('Cuentas sincronizadas correctamente.')
        setConnecting(false)
      } catch (err) {
        console.error('Plaid Exchange Error:', err)
      }
    },
    onExit: () => {
      setConnecting(false)
      setLinkToken(null)
    }
  })

  useEffect(() => {
    if (ready && linkToken) open()
  }, [ready, linkToken, open])

  if (loading) return (
    <div className="min-h-screen bg-[#0E1117] flex items-center justify-center">
      <div className="w-16 h-px bg-white/10 overflow-hidden">
        <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1 }} className="h-full bg-[#00E676] w-full" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0E1117] text-white selection:bg-[#00E676] selection:text-black antialiased">
      {/* HEADER INSTITUCIONAL */}
      <header className="border-b border-white/5 bg-black sticky top-0 z-50 px-12 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/dashboard/company')} className="flex items-center gap-4 group">
            <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-white">Regresar</span>
          </button>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">Configuración de Infraestructura</h1>
          <div className="w-24 h-px bg-white/5" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-12 pb-40 space-y-24">
        <form onSubmit={handleSave} className="space-y-32">
          
          {/* SECCIÓN: IDENTIDAD FISCAL */}
          <section className="space-y-12">
            <div className="flex items-center gap-6 border-b border-white/5 pb-8">
              <div className="h-6 w-1 bg-[#00E676]" />
              <h2 className="text-sm font-black uppercase tracking-[0.5em]">Identidad Fiscal</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {[
                 { label: 'Razón Social', key: 'company_name', type: 'text', large: true },
                 { label: 'CIF / NIF', key: 'cif_nif', type: 'text' },
                 { label: 'Serie Facturación', key: 'default_series', type: 'text' },
                 { label: 'Dirección Registrada', key: 'fiscal_address', type: 'text', large: true },
                 { label: 'CP', key: 'zip_code', type: 'text', small: true },
                 { label: 'Ciudad', key: 'city', type: 'text' },
                 { label: 'Provincia', key: 'province', type: 'text' },
                 { label: 'Email Corporativo', key: 'email', type: 'email' },
               ].map((field) => (
                 <div key={field.key} className={cn("space-y-3", field.large && "md:col-span-2", field.small && "md:col-span-1")}>
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">{field.label}</label>
                    <input 
                      type={field.type}
                      value={(profile as any)[field.key]}
                      onChange={e => setProfile({...profile, [field.key]: e.target.value.toUpperCase()})}
                      className="w-full bg-white/5 border border-white/5 rounded-none px-6 py-5 text-sm font-bold uppercase tracking-widest focus:border-[#00E676] outline-none transition-all placeholder:opacity-20"
                    />
                 </div>
               ))}
            </div>
          </section>

          {/* SECCIÓN: OPEN BANKING (PLAID) */}
          <section className="space-y-12">
            <div className="flex items-center gap-6 border-b border-white/5 pb-8">
              <div className="h-6 w-1 bg-[#00E676]" />
              <h2 className="text-sm font-black uppercase tracking-[0.5em]">Automatización Bancaria</h2>
            </div>

            <div className="bg-black border border-white/5 p-16 space-y-12 rounded-none relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
               
               <div className="grid lg:grid-cols-2 gap-20 items-start relative z-10">
                  <div className="space-y-8">
                     <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 border border-white/10">
                        <Shield className="w-3 h-3 text-[#00E676]" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Protocolo PSD2 // Encriptado</span>
                     </div>
                     <h3 className="text-4xl font-black italic tracking-tighter leading-none uppercase">Conciliación <br/><span className="text-[#00E676]">Automatizada.</span></h3>
                     <p className="text-xs font-bold text-gray-600 uppercase tracking-widest leading-loose">
                       Integramos sus flujos de caja directamente en el terminal. Al detectar un ingreso que coincida con una emisión, FacturAI liquidará la factura en tiempo real sin intervención humana.
                     </p>
                  </div>

                  <div className="flex flex-col gap-10">
                     <div className="bg-white p-12 rounded-none flex items-center justify-between opacity-50 grayscale group-hover:opacity-100 transition-all duration-700 shadow-inner">
                        <img src="https://logo.clearbit.com/santander.com" className="h-6" alt="Santander" />
                        <img src="https://logo.clearbit.com/bbva.com" className="h-6" alt="BBVA" />
                        <img src="https://logo.clearbit.com/ing.es" className="h-6" alt="ING" />
                     </div>
                     
                     <button 
                       type="button"
                       onClick={initPlaidLink}
                       disabled={connecting}
                       className="bg-white text-black py-8 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-[#00E676] transition-all rounded-none shadow-[0_40px_100px_rgba(255,255,255,0.05)] border-b-4 border-black/10 active:translate-y-1 active:border-b-0"
                     >
                       {connecting ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-black" /> : 'Sincronizar Pasarela Bancaria'}
                     </button>
                  </div>
               </div>
            </div>
          </section>

          {/* SECCIÓN: GESTORÍA CONNECT */}
          <section className="space-y-12">
            <div className="flex items-center gap-6 border-b border-white/5 pb-8">
              <div className="h-6 w-1 bg-[#00E676]" />
              <h2 className="text-sm font-black uppercase tracking-[0.5em]">Asesoría Connect</h2>
            </div>

            <div className="bg-black border border-white/5 p-12 space-y-8 rounded-none relative overflow-hidden">
               <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3">
                     <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado de Vinculación</div>
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-700 rounded-full" />
                        <span className="text-sm font-bold uppercase tracking-widest text-gray-400 italic">Terminal Independiente</span>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button 
                       type="button"
                       className="border border-white/10 px-8 py-4 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                     >
                       INVITAR A MI GESTOR
                     </button>
                     <button 
                       type="button"
                       className="bg-[#00E676] text-black px-8 py-4 text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl"
                     >
                       VINCULAR DESPACHO
                     </button>
                  </div>
               </div>
               <p className="text-[9px] font-medium text-gray-600 uppercase tracking-[0.2em] leading-loose max-w-2xl">
                 Al vincular su terminal, su gestor podrá auditar sus facturas y conciliaciones en tiempo real, garantizando el cumplimiento del protocolo <strong className="text-white">Veri*Factu</strong> sin envíos manuales de documentación.
               </p>
            </div>
          </section>

          {/* SECCIÓN: FIRMA DIGITAL */}
          <section className="space-y-12">
            <div className="flex items-center gap-6 border-b border-white/5 pb-8">
              <div className="h-6 w-1 bg-[#00E676]" />
              <h2 className="text-sm font-black uppercase tracking-[0.5em]">Firma Digital</h2>
            </div>

            <div className={cn(
              "p-16 border-2 border-dashed transition-all flex flex-col items-center justify-center gap-8",
              profile.certificate_status === 'pending' ? "border-white/5 bg-black/40" : "border-[#00E676]/30 bg-[#00E676]/5"
            )}>
               <Fingerprint className={cn("w-16 h-16", profile.certificate_status === 'pending' ? "text-gray-800" : "text-[#00E676]")} />
               <div className="text-center space-y-2">
                  <div className="text-xs font-black uppercase tracking-widest">Certificado FNMT .p12</div>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                    {profile.certificate_status === 'pending' ? 'Necesario para la validez legal ante AEAT' : 'INSTALADO Y PROTEGIDO // AES-256'}
                  </p>
               </div>
               <input type="file" id="cert" className="hidden" onChange={e => setCertFile(e.target.files?.[0] || null)} />
               <label htmlFor="cert" className="cursor-pointer border border-white/10 px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                  {certFile ? certFile.name : 'SUBIR CERTIFICADO'}
               </label>
            </div>
          </section>

          {/* BOTÓN DE ACCIÓN GLOBAL */}
          <div className="pt-24 border-t border-white/5 flex flex-col items-center gap-12">
             <button 
               type="submit"
               disabled={saving}
               className="bg-[#00E676] text-black px-24 py-8 text-sm font-black uppercase tracking-[0.5em] hover:bg-white transition-all shadow-[0_0_80px_rgba(0,230,118,0.2)]"
             >
               {saving ? 'SINCRONIZANDO...' : 'ACTUALIZAR INFRAESTRUCTURA'}
             </button>

             <AnimatePresence>
               {success && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 text-[#00E676]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocolo Actualizado con Éxito</span>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

        </form>
      </main>
    </div>
  )
}
