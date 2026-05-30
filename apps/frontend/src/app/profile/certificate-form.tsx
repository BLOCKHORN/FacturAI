'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CertificateForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch('/api/profile/certificate', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir el certificado')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded bg-alert/20 border border-alert text-alert text-xs font-bold uppercase">
          {error}
        </div>
      )}
      
      <div className="relative border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center hover:border-success/50 transition-colors cursor-pointer group">
        <input 
          type="file" 
          name="certificate"
          className="absolute inset-0 opacity-0 cursor-pointer" 
          accept=".p12,.pfx" 
          required
        />
        <div className="text-gray-500 group-hover:text-success transition-colors mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Subir Certificado</span>
      </div>
      
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clave de Paso del Certificado</label>
        <input 
          type="password" 
          name="password"
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-success outline-none transition-all"
          placeholder="Contraseña del archivo .p12"
        />
        <p className="text-[10px] text-gray-600 mt-2 italic">La clave será encriptada con AES-256-GCM antes de ser almacenada.</p>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-success text-background font-bold py-4 rounded-lg uppercase tracking-widest hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : 'Vincular Certificado de Firma'}
      </button>
    </form>
  )
}
