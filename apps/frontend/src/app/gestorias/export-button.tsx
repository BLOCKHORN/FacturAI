'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ExportButton({ clientId, clientName, variant = 'primary' }: { clientId?: string, clientName?: string, variant?: 'primary' | 'secondary' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const url = clientId ? `/api/invoices/export?clientId=${clientId}` : '/api/invoices/export'
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error en la exportación')
      }

      // Procesar blob (el ZIP)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = clientName ? `facturas_${clientName.replace(/\s+/g, '_')}_${dateStr}.zip` : `exportacion_global_${dateStr}.zip`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'secondary') {
    return (
      <div className="w-full flex flex-col items-center">
        {error && <span className="text-alert text-[10px] mb-1">{error}</span>}
        <button 
          onClick={handleExport}
          disabled={loading}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          {loading ? 'Comprimiendo...' : 'Descargar ZIP'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end">
      {error && <span className="text-alert text-xs mb-2 font-bold">{error}</span>}
      <button 
        onClick={handleExport}
        disabled={loading}
        className="bg-success text-background font-black px-6 py-3 rounded-lg uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(0,230,118,0.2)] disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5 12 16.5m0 0 3-3m-3 3v-6m1.06-4.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>
        {loading ? 'Generando...' : 'Exportar Todo (ZIP)'}
      </button>
    </div>
  )
}
