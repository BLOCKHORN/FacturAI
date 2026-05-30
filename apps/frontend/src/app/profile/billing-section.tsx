'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function BillingSection({ status, customerId }: { status?: string, customerId?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleManage = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'text-success border-success/20 bg-success/10'
      case 'trial': return 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10'
      case 'past_due': return 'text-orange-400 border-orange-400/20 bg-orange-400/10'
      default: return 'text-alert border-alert/20 bg-alert/10'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'active': return 'Suscripción Activa'
      case 'trial': return 'Período de Prueba'
      case 'past_due': return 'Pago Pendiente'
      case 'canceled': return 'Suscripción Cancelada'
      default: return 'Sin Suscripción'
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Plan y Facturación</h2>
        <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getStatusColor()}`}>
          {getStatusLabel()}
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-6 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-white font-bold text-xl uppercase tracking-tight">Plan Industrial Premium</div>
          <div className="text-gray-400 text-sm">300€ / mes + IVA • Pago mediante Adeudo SEPA</div>
        </div>

        {status === 'active' ? (
          <button 
            onClick={handleManage}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-widest text-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Gestionar en Stripe'}
          </button>
        ) : (
          <button 
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-success text-background font-black py-3 px-8 rounded-lg uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,230,118,0.2)] disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Activar Plan Premium'}
          </button>
        )}
      </div>

      {error && <p className="mt-4 text-alert text-xs font-bold uppercase">{error}</p>}
      
      <p className="mt-6 text-[10px] text-gray-500 uppercase leading-relaxed max-w-2xl">
        Al suscribirte, autorizas a FacturAI a enviar instrucciones a tu entidad financiera para adeudar en tu cuenta. Se te notificará antes de cada cobro conforme a la normativa SEPA vigente.
      </p>
    </section>
  )
}
