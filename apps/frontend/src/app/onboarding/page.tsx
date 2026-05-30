'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Landmark, 
  FileCheck, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  ShieldCheck,
  Upload,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utils/cn'

const STEPS = [
  { id: 1, name: 'Perfil Fiscal', icon: Building2 },
  { id: 2, name: 'Conexión Bancaria', icon: Landmark },
  { id: 3, name: 'Certificado Digital', icon: FileCheck },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    razonSocial: '',
    nif: '',
    address: '',
    bankConnected: false,
    certificateUploaded: false,
    certificateName: ''
  })
  const router = useRouter()

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const handleFinish = () => {
    // Simulated finish
    router.push('/dashboard/company')
  }

  return (
    <div className="min-h-screen bg-[#0E1117] text-white font-sans selection:bg-[#00E676] selection:text-black flex flex-col">
      {/* Massive Whitespace Header */}
      <header className="pt-24 pb-12 px-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-white/10" />
          <div className="flex gap-4">
            {STEPS.map((step) => (
              <div 
                key={step.id}
                className={cn(
                  "w-3 h-3 border transition-all duration-500",
                  currentStep >= step.id ? "bg-[#00E676] border-[#00E676]" : "bg-transparent border-white/20"
                )}
              />
            ))}
          </div>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        
        <div className="text-center space-y-4">
          <div className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.5em] animate-pulse">
            STEP {currentStep} OF {STEPS.length}
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            {STEPS[currentStep - 1].name}
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            {currentStep === 1 && (
              <div className="space-y-8 py-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Nombre o Razón Social</label>
                    <input 
                      type="text"
                      value={formData.razonSocial}
                      onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                      placeholder="ACME SOLUTIONS S.L."
                      className="w-full bg-white/5 border border-white/10 px-8 py-6 text-2xl font-black italic focus:border-[#00E676] outline-none transition-all placeholder:text-white/10 rounded-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">NIF / CIF</label>
                      <input 
                        type="text"
                        value={formData.nif}
                        onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                        placeholder="B12345678"
                        className="w-full bg-white/5 border border-white/10 px-8 py-6 text-xl font-mono font-black focus:border-[#00E676] outline-none transition-all placeholder:text-white/10 rounded-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Dirección Fiscal</label>
                      <input 
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Calle Industria 42"
                        className="w-full bg-white/5 border border-white/10 px-8 py-6 text-xl font-black italic focus:border-[#00E676] outline-none transition-all placeholder:text-white/10 rounded-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="py-24 flex flex-col items-center text-center space-y-12">
                <div className="w-32 h-32 bg-white/5 flex items-center justify-center relative">
                  <Landmark className="w-16 h-16 text-white/20" />
                  <div className="absolute inset-0 border border-[#00E676]/20 animate-pulse" />
                </div>
                
                <div className="max-w-md space-y-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Sincronización Bancaria</h2>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">
                    Conecte sus cuentas para automatizar la conciliación de facturas. Utilizamos seguridad de nivel bancario via Plaid.
                  </p>
                </div>

                <button
                  onClick={() => setFormData({ ...formData, bankConnected: true })}
                  className={cn(
                    "group relative px-12 py-6 font-black uppercase tracking-[0.3em] transition-all rounded-none overflow-hidden",
                    formData.bankConnected 
                      ? "bg-[#00E676] text-black" 
                      : "bg-white text-black hover:bg-[#00E676]"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {formData.bankConnected ? (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        BANCO CONECTADO
                      </>
                    ) : (
                      <>
                        CONECTAR CON PLAID
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="py-12 space-y-12">
                <div className="bg-[#00E676]/5 border border-[#00E676]/20 p-12 flex flex-col items-center text-center space-y-8 rounded-none">
                  <ShieldCheck className="w-16 h-16 text-[#00E676]" />
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Certificado Digital (FNMT/AC)</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Requerido para el sistema Verifactu / TicketBAI</p>
                  </div>
                  
                  <label className="w-full cursor-pointer group">
                    <div className="border-2 border-dashed border-white/10 group-hover:border-[#00E676]/50 py-16 transition-all flex flex-col items-center gap-4">
                      <Upload className="w-8 h-8 text-white/20 group-hover:text-[#00E676] transition-colors" />
                      <span className="text-xs font-black uppercase tracking-widest">
                        {formData.certificateName || 'Subir archivo .p12 / .pfx'}
                      </span>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".p12,.pfx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setFormData({ ...formData, certificateUploaded: true, certificateName: file.name })
                      }}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#00E676]" />
                  Encriptación AES-256 de extremo a extremo
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 group disabled:opacity-0 transition-all"
          >
            <div className="bg-white/5 p-3 group-hover:bg-white group-hover:text-black transition-all">
              <ChevronLeft className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white transition-colors">ATRÁS</span>
          </button>

          <div className="hidden md:flex flex-col items-center">
             <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] mb-1">PROGRESO</div>
             <div className="text-xl font-black italic tracking-tighter uppercase">{STEPS[currentStep-1].name}</div>
          </div>

          <button
            onClick={currentStep === STEPS.length ? handleFinish : nextStep}
            className="flex items-center gap-4 group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E676]">
              {currentStep === STEPS.length ? 'FINALIZAR SETUP' : 'CONTINUAR'}
            </span>
            <div className="bg-[#00E676] text-black p-3 group-hover:scale-110 transition-all">
              {currentStep === STEPS.length ? <CheckCircle2 className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </div>
          </button>
        </div>
      </footer>
    </div>
  )
}
