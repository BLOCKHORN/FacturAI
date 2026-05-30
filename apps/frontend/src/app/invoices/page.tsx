'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Database } from 'lucide-react'

export default function InvoicesPage() {
  return (
    <div className="min-h-screen bg-[#0E1117] text-white font-sans selection:bg-[#00E676] selection:text-black flex flex-col">
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/dashboard/company" className="flex items-center gap-2 group">
            <div className="bg-white/5 p-2 group-hover:bg-[#00E676] group-hover:text-black transition-all rounded-none">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-white transition-colors">VOLVER AL PANEL</span>
          </Link>
          <div className="text-right">
             <div className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.5em] mb-1">ARCHIVO HISTÓRICO</div>
             <h1 className="text-2xl font-black italic tracking-tighter uppercase">Facturas Emitidas</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full border border-white/10 bg-white/5 p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E676] to-transparent opacity-50"></div>
          <Database className="w-12 h-12 text-gray-700 mx-auto mb-6" />
          <h2 className="text-xl font-black italic uppercase tracking-tighter mb-2">Módulo en Desarrollo</h2>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
            El archivo centralizado de facturas con opciones de filtrado avanzado y exportación en bloque estará disponible en la próxima actualización del sistema.
          </p>
          <Link href="/invoices/new" className="inline-block bg-[#00E676] text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,230,118,0.2)]">
            Emitir Nueva Factura
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
