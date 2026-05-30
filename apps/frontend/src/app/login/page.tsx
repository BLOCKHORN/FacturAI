'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Building2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { createClient } from '@/utils/supabase/client'

import GoogleLoginButton from './google-button'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-[#0E1117] text-white font-sans selection:bg-[#00E676] selection:text-black overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00E676] opacity-[0.03] blur-[120px] rounded-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FF3D00] opacity-[0.02] blur-[120px] rounded-none"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col md:flex-row">
        
        {/* Left Side: Industrial Branding */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 border-r border-white/5 bg-black/20 backdrop-blur-3xl">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tighter italic">FACTURA<span className="text-[#00E676]">AI</span></span>
          </Link>

          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-[#00E676] text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] inline-block rounded-none">
                ACCESO RESTRINGIDO
              </div>
              <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                INFRAESTRUCTURA <br />
                <span className="text-[#00E676]">FISCAL CRÍTICA</span>
              </h1>
              <p className="max-w-md text-gray-500 font-bold uppercase tracking-tight text-sm leading-tight">
                SISTEMA HOMOLOGADO PARA EL CUMPLIMIENTO DEL REGLAMENTO VERIFACTU Y LA LEY CREA Y CRECE 2026.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
               <div className="space-y-2">
                  <Lock className="w-5 h-5 text-[#00E676]" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-white">Encriptación AES-256</div>
                  <div className="text-[9px] text-gray-600 font-bold uppercase">Protocolo Militar Activo</div>
               </div>
               <div className="space-y-2">
                  <ShieldCheck className="w-5 h-5 text-[#00E676]" />
                  <div className="text-[10px] font-black uppercase tracking-widest text-white">Certificado AEAT</div>
                  <div className="text-[9px] text-gray-600 font-bold uppercase">Nodo de Red Verificado</div>
               </div>
            </div>
          </div>

          <div className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">
            © 2026 FACTURAI TECNOLOGÍAS S.L. // TODOS LOS DERECHOS RESERVADOS
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[420px] space-y-10"
          >
            <div className="space-y-2 text-center lg:text-left">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">IDENTIFICACIÓN</h2>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Introduzca sus credenciales de acceso</p>
            </div>

            <div className="space-y-6">
              {/* Google Login - REINTREGRATED REAL COMPONENT */}
              <GoogleLoginButton />

              <div className="relative py-2 flex items-center gap-4">
                 <div className="flex-1 h-[1px] bg-white/10"></div>
                 <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">O ACCESO MANUAL</span>
                 <div className="flex-1 h-[1px] bg-white/10"></div>
              </div>

              {error && (
                <div className="bg-[#FF3D00]/10 border border-[#FF3D00]/20 p-4 flex gap-3 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-[#FF3D00] shrink-0" />
                  <div className="text-[10px] font-black text-[#FF3D00] uppercase tracking-widest leading-tight">
                    ERROR DE AUTENTICACIÓN: {error.toUpperCase()}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">CIF / Correo Electrónico</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#00E676] transition-colors" />
                      <input 
                        type="email" 
                        required
                        placeholder="CIF O EMAIL PROFESIONAL"
                        className="w-full bg-white/5 border border-white/10 rounded-none py-4 pl-12 pr-4 text-[11px] font-black uppercase tracking-widest focus:border-[#00E676] focus:bg-white/10 outline-none transition-all placeholder:text-gray-700"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Contraseña de Acceso</label>
                      <Link href="#" className="text-[9px] font-black text-gray-600 hover:text-[#00E676] uppercase tracking-widest">¿Olvido su clave?</Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#00E676] transition-colors" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-none py-4 pl-12 pr-4 text-[11px] font-black uppercase tracking-widest focus:border-[#00E676] focus:bg-white/10 outline-none transition-all placeholder:text-gray-700"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <Button 
                    type="submit"
                    size="xl" 
                    disabled={loading}
                    className="w-full rounded-none text-sm group"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-none"></div>
                        AUTENTICANDO...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        ACCEDER AL SISTEMA
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                  
                  <div className="bg-[#FF3D00]/5 border border-[#FF3D00]/10 p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-[#FF3D00] shrink-0" />
                    <div className="text-[9px] font-bold text-gray-500 leading-tight uppercase">
                        AVISO: El acceso no autorizado a este sistema fiscal está monitorizado y constituye una infracción bajo el RD 238/2026.
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-8 text-center">
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  ¿Aún no tiene licencia? <Link href="/#pricing" className="text-[#00E676] hover:underline">CONTRATAR PLAN 2026</Link>
               </p>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Industrial Decorative Stripes */}
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#00E676]/20 to-transparent"></div>
    </div>
  )
}
