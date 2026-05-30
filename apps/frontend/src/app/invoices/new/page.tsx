'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Sparkles, 
  Camera, 
  ShieldCheck, 
  Building2,
  TableProperties,
  Landmark,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Search,
  Mail,
  Phone
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/utils/cn'
import { validateSpanishID } from '@/utils/validation'

export default function NewInvoicePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'looking_up' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [cifValid, setCifValid] = useState<boolean | null>(null)
  const [lookupSource, setLookupSource] = useState<'private' | 'global' | 'vies' | null>(null)
  
  const [buyerData, setBuyerData] = useState({
    cif: '',
    name: '',
    address: '',
    city: '',
    zipCode: '',
    province: '',
    email: '',
    phone: '',
    accounting_office: '',
    managing_body: '',
    processing_unit: ''
  })

  const nameInputRef = useRef<HTMLInputElement>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const zipCodeInputRef = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const provinceInputRef = useRef<HTMLInputElement>(null)

  const [items, setItems] = useState<any[]>([
    { id: Date.now(), concept: '', quantity: 1, totalPrice: 0, taxPercentage: 21 }
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCIFLookup = async (cif: string) => {
    const cleanCif = cif.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (cleanCif.length !== 9) {
      setCifValid(false)
      return
    }
    
    const isValid = validateSpanishID(cleanCif)
    setCifValid(isValid)
    if (!isValid) return

    setStatus('looking_up')
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/company/lookup?cif=${cleanCif}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      
      if (!res.ok) {
        setStatus('idle')
        setLookupSource(null)
        if (res.status === 404) {
          setError('NotFound')
          setTimeout(() => nameInputRef.current?.focus(), 100)
        }
        return
      }

      const result = await res.json()
      
      if (result) {
        setBuyerData(prev => ({
          ...prev,
          name: result.legal_name || result.name || '',
          address: result.address || '',
          city: result.city || '',
          zipCode: result.zip_code || result.zipCode || '',
          province: result.province || '',
          email: result.email || prev.email,
          phone: result.phone || result.phone_number || prev.phone,
          accounting_office: result.accounting_office || result.accountingOffice || prev.accounting_office,
          managing_body: result.managing_body || result.managingBody || prev.managing_body,
          processing_unit: result.processing_unit || result.processingUnit || prev.processing_unit
        }))
        
        setLookupSource(result.source || source)
        setStatus('done')
        setTimeout(() => setStatus('idle'), 3000)

        setTimeout(() => {
          const r = result;
          if (!(r.legal_name || r.name)) nameInputRef.current?.focus()
          else if (!r.address) addressInputRef.current?.focus()
          else if (!(r.zip_code || r.zipCode)) zipCodeInputRef.current?.focus()
          else if (!r.city) cityInputRef.current?.focus()
          else if (!r.province) provinceInputRef.current?.focus()
        }, 100)
      } else {
        setStatus('idle')
      }
    } catch (err) {
      console.error('Lookup Error:', err)
      setStatus('idle')
      setLookupSource(null)
    }
  }

  const addItem = () => {
    setItems([...items, { id: Date.now(), concept: '', quantity: 1, totalPrice: 0, taxPercentage: 21 }])
  }

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0)
  }

  const handleMagicIA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setStatus('analyzing')
      setError(null)
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = error => reject(error)
      })

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ imageBase64: base64 })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      setBuyerData(prev => ({
        ...prev,
        cif: result.data.cif_cliente || prev.cif,
        name: result.data.empresa_cliente || prev.name
      }))

      setItems([{
        id: Date.now(),
        concept: result.data.lineas_concepto || '',
        quantity: 1,
        totalPrice: result.data.importe_total_con_iva || 0,
        taxPercentage: 21
      }])

      if (result.data.cif_cliente) handleCIFLookup(result.data.cif_cliente)

      setStatus('done')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err: any) {
      setError(err.message)
      setStatus('idle')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          clientId: 'auto-detect-or-create',
          items: items.map(i => {
            const total = parseFloat(i.totalPrice) || 0
            const taxRate = parseFloat(i.taxPercentage) / 100
            const unitPriceWithTax = total / parseFloat(i.quantity)
            const unitPriceBase = unitPriceWithTax / (1 + taxRate)
            return {
              concept: i.concept,
              quantity: parseFloat(i.quantity),
              unitPrice: unitPriceBase,
              taxPercentage: parseFloat(i.taxPercentage)
            }
          }),
          buyer: buyerData
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/dashboard/company')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0E1117] text-white font-sans selection:bg-[#00E676] selection:text-black">
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push('/dashboard/company');
            }} 
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="bg-white/5 p-2 group-hover:bg-[#FF3D00] group-hover:text-white transition-all rounded-none">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-white transition-colors">CANCELAR</span>
          </button>
          <div className="text-center">
             <div className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.5em] mb-1">FACTURACIÓN ELECTRÓNICA</div>
             <h1 className="text-2xl font-black italic tracking-tighter uppercase">Crear Facturae</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest border border-white/10 px-3 py-2 rounded-none">
             <ShieldCheck className="w-3 h-3 text-[#00E676]" />
             XAdES-BES Activo
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12 pb-32">
        <AnimatePresence mode="wait">
          {status === 'analyzing' || status === 'looking_up' ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="py-32 flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-[#00E676]/20 border-t-[#00E676] rounded-none animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#00E676] animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                  {status === 'analyzing' ? 'Invocando Inteligencia...' : 'Buscando Cliente en Archivo...'}
                </h2>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                  {status === 'analyzing' ? 'Extrayendo datos del documento' : 'Verificando datos locales del CIF'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group bg-[#00E676] px-8 py-6 rounded-none flex items-center gap-4 text-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,230,118,0.1)]"
                >
                  <Camera className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-black text-xl uppercase tracking-tighter leading-none">CÁMARA IA</div>
                    <div className="text-[9px] font-black uppercase tracking-widest opacity-60">FOTO AL INSTANTE</div>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group bg-white/5 border border-white/10 px-8 py-6 rounded-none flex items-center gap-4 text-white overflow-hidden transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-8 h-8 text-[#00E676] group-hover:text-black" />
                  <div className="text-left">
                    <div className="font-black text-xl uppercase tracking-tighter leading-none">SINCRONIZAR IA</div>
                    <div className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">PROCESADO GEMINI OCR</div>
                  </div>
                </button>

                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleMagicIA}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-16">
                <section className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <h2 className="text-xs font-black uppercase tracking-[0.4em]">Datos del Cliente</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-[#00E676] uppercase tracking-widest flex items-center justify-between">
                        <span>CIF / NIF</span>
                        {cifValid === false && <span className="text-[#FF3D00] animate-pulse">CIF INVÁLIDO</span>}
                        {cifValid === true && <span className="text-[#00E676]">CIF VÁLIDO</span>}
                      </label>
                      <div className="relative group">
                        <input 
                          type="text" 
                          required
                          value={buyerData.cif}
                          onBlur={e => handleCIFLookup(e.target.value)}
                          onChange={e => {
                            const val = e.target.value.toUpperCase()
                            setBuyerData({...buyerData, cif: val})
                            const clean = val.replace(/[^A-Z0-9]/g, '')
                            if (clean.length === 9) {
                              const isValid = validateSpanishID(clean)
                              setCifValid(isValid)
                              if (isValid) handleCIFLookup(clean)
                            } else {
                              setCifValid(null)
                            }
                          }}
                          className={cn(
                            "w-full bg-white/5 border rounded-none px-4 py-5 text-xl font-mono font-black focus:border-[#00E676] outline-none transition-all pl-12 pr-16",
                            cifValid === false ? "border-[#FF3D00]" : "border-white/10"
                          )}
                          placeholder="B12345678"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00E676] transition-colors" />
                        <button 
                          type="button"
                          onClick={() => handleCIFLookup(buyerData.cif)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00E676] text-black p-2 hover:scale-105 active:scale-95 transition-all rounded-none"
                        >
                          <Sparkles className="w-5 h-5" />
                        </button>
                      </div>
                      {error === 'NotFound' && (
                        <p className="text-[9px] font-black text-[#FF3D00] uppercase tracking-widest mt-2 animate-pulse">
                          Empresa no encontrada. Por favor, complete los datos manualmente para guardarla en su archivo.
                        </p>
                      )}
                      {lookupSource && (
                        <p className="text-[9px] font-black text-[#00E676] uppercase tracking-widest mt-2 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          Origen: {lookupSource === 'private' ? 'ARCHIVO PRIVADO' : lookupSource === 'global' ? 'BASE DE DATOS VERIFICADA' : 'VIES (UE)'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nombre / Razón Social</label>
                      <input 
                        type="text" 
                        required
                        ref={nameInputRef}
                        value={buyerData.name}
                        onChange={e => setBuyerData({...buyerData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-5 text-lg font-black italic focus:border-[#00E676] outline-none transition-all"
                        placeholder="RELLENAR NOMBRE"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dirección Fiscal</label>
                      <input 
                        type="text" 
                        required
                        ref={addressInputRef}
                        value={buyerData.address}
                        onChange={e => setBuyerData({...buyerData, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-5 text-sm font-black italic focus:border-[#00E676] outline-none transition-all"
                        placeholder="CALLE, NÚMERO..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Código Postal</label>
                          <input 
                            type="text" 
                            required
                            ref={zipCodeInputRef}
                            value={buyerData.zipCode}
                            onChange={e => setBuyerData({...buyerData, zipCode: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-sm font-mono focus:border-[#00E676] outline-none transition-all"
                            placeholder="12000"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Población / Ciudad</label>
                          <input 
                            type="text" 
                            required
                            ref={cityInputRef}
                            value={buyerData.city}
                            onChange={e => setBuyerData({...buyerData, city: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-sm font-black italic focus:border-[#00E676] outline-none transition-all"
                            placeholder="ONDA"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Provincia</label>
                          <input 
                            type="text" 
                            required
                            ref={provinceInputRef}
                            value={buyerData.province}
                            onChange={e => setBuyerData({...buyerData, province: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-sm font-black italic focus:border-[#00E676] outline-none transition-all"
                            placeholder="CASTELLON"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Email de Envío
                      </label>
                      <input 
                        type="email" 
                        value={buyerData.email}
                        onChange={e => setBuyerData({...buyerData, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-sm font-black focus:border-[#00E676] outline-none transition-all"
                        placeholder="cliente@empresa.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Phone className="w-3 h-3" /> Teléfono
                      </label>
                      <input 
                        type="text" 
                        value={buyerData.phone}
                        onChange={e => setBuyerData({...buyerData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-sm font-black focus:border-[#00E676] outline-none transition-all"
                        placeholder="600 000 000"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {(buyerData.cif.startsWith('P') || buyerData.cif.startsWith('Q') || buyerData.cif.startsWith('S')) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#00E676]/5 border border-[#00E676]/20 p-8 space-y-6 rounded-none">
                           <div className="flex items-center gap-3 border-b border-[#00E676]/10 pb-4">
                              <Landmark className="w-5 h-5 text-[#00E676]" />
                              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#00E676]">Administración Pública (DIR3 Obligatorio)</h2>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Oficina Contable</label>
                                <input 
                                  type="text" 
                                  value={buyerData.accounting_office}
                                  onChange={e => setBuyerData({...buyerData, accounting_office: e.target.value})}
                                  className="w-full bg-black/40 border border-[#00E676]/30 rounded-none px-4 py-4 text-xs font-mono focus:border-[#00E676] outline-none transition-all"
                                  placeholder="L00000000"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Órgano Gestor</label>
                                <input 
                                  type="text" 
                                  value={buyerData.managing_body}
                                  onChange={e => setBuyerData({...buyerData, managing_body: e.target.value})}
                                  className="w-full bg-black/40 border border-[#00E676]/30 rounded-none px-4 py-4 text-xs font-mono focus:border-[#00E676] outline-none transition-all"
                                  placeholder="L00000000"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidad Tramitadora</label>
                                <input 
                                  type="text" 
                                  value={buyerData.processing_unit}
                                  onChange={e => setBuyerData({...buyerData, processing_unit: e.target.value})}
                                  className="w-full bg-black/40 border border-[#00E676]/30 rounded-none px-4 py-4 text-xs font-mono focus:border-[#00E676] outline-none transition-all"
                                  placeholder="L00000000"
                                />
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <TableProperties className="w-5 h-5 text-gray-500" />
                      <h2 className="text-xs font-black uppercase tracking-[0.4em]">Conceptos de la Factura</h2>
                    </div>
                    <button 
                      type="button"
                      onClick={addItem}
                      className="bg-[#00E676] text-black px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-transform hover:scale-105 rounded-none"
                    >
                      <Plus className="w-3 h-3" /> AÑADIR LÍNEA
                    </button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/40 border border-white/5 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end relative group rounded-none"
                      >
                        <div className="lg:col-span-6 space-y-2">
                          <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Concepto / Descripción</label>
                          <input 
                            type="text" 
                            required
                            value={item.concept}
                            onChange={e => updateItem(item.id, 'concept', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-sm font-black italic focus:border-[#00E676] outline-none transition-all"
                            placeholder="Ej: Mantenimiento Preventivo"
                          />
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                          <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Cant.</label>
                          <input 
                            type="number" 
                            required
                            value={item.quantity}
                            onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-sm font-black focus:border-[#00E676] outline-none transition-all"
                          />
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                          <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">IVA</label>
                          <div className="grid grid-cols-2 gap-1">
                            {[21, 10, 4, 0].map((rate) => (
                              <button
                                key={rate}
                                type="button"
                                onClick={() => updateItem(item.id, 'taxPercentage', rate)}
                                className={cn(
                                  "py-1 text-[10px] font-black border transition-all rounded-none",
                                  item.taxPercentage === rate 
                                    ? "bg-[#00E676] border-[#00E676] text-black" 
                                    : "bg-white/5 border-white/10 text-gray-500 hover:border-white/30"
                                )}
                              >
                                {rate}%
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                          <label className="text-[8px] font-black text-[#00E676] uppercase tracking-widest">Total Línea (IVA incl.)</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.01"
                              required
                              value={item.totalPrice}
                              onChange={e => updateItem(item.id, 'totalPrice', e.target.value)}
                              className="w-full bg-white/5 border border-[#00E676]/30 rounded-none px-4 py-3 text-sm font-black focus:border-[#00E676] outline-none transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#00E676]">€</span>
                          </div>
                          <div className="flex flex-col gap-1 text-[8px] font-black uppercase tracking-tighter px-1">
                             <div className="flex justify-between border-b border-white/5 pb-1">
                               <span className="text-gray-500">BASE:</span>
                               <span className="text-white">{(parseFloat(item.totalPrice || '0') / (1 + item.taxPercentage/100)).toFixed(2)}€</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-gray-500">CUOTA {item.taxPercentage}%:</span>
                               <span className="text-[#00E676]">{(parseFloat(item.totalPrice || '0') - (parseFloat(item.totalPrice || '0') / (1 + item.taxPercentage/100))).toFixed(2)}€</span>
                             </div>
                          </div>
                        </div>
                        <div className="lg:col-span-1 flex justify-end">
                           <button 
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-3 text-gray-700 hover:text-[#FF3D00] transition-colors"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                <div className="bg-[#00E676]/5 border-t border-b border-[#00E676]/20 py-12 px-8 flex flex-col md:flex-row items-center justify-between gap-8 rounded-none">
                   <div className="text-center md:text-left space-y-1">
                      <div className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.5em]">TOTAL A COBRAR (IVA INCL.)</div>
                      <div className="text-6xl md:text-8xl font-black tracking-tighter text-white">
                        {calculateTotal().toLocaleString('es-ES', { minimumFractionDigits: 2 })}<span className="text-3xl text-[#00E676] ml-2">€</span>
                      </div>
                   </div>

                   <button 
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-[#00E676] text-black font-black text-2xl px-16 py-8 rounded-none uppercase tracking-[0.4em] hover:shadow-[0_0_50px_rgba(0,230,118,0.4)] transition-all disabled:opacity-50 group relative overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-4">
                      {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <CheckCircle2 className="w-8 h-8" />}
                      {loading ? 'FIRMANDO...' : 'EMITIR'}
                    </div>
                  </button>
                </div>

                <p className="text-center text-[9px] font-black text-gray-700 uppercase tracking-[0.5em]">
                   AL EMITIR LA FACTURA, EL DOCUMENTO SE FIRMA DIGITALMENTE Y SE NOTIFICA LEGALMENTE A LA AEAT.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {status === 'done' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="bg-[#00E676] text-black px-8 py-4 flex flex-col items-center gap-1 font-black uppercase tracking-widest text-xs shadow-2xl border-4 border-black rounded-none">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6" />
                ¡DATOS CARGADOS!
              </div>
              <div className="text-[8px] opacity-70">
                ORIGEN: {lookupSource === 'private' ? 'ARCHIVO PROPIO' : lookupSource === 'global' ? 'BASE VERIFICADA' : 'VIES (OFICIAL)'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
