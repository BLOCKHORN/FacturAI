import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CertificateForm from './certificate-form'
import BillingSection from './billing-section'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <h1 className="text-xl font-bold text-white">Configuración del Perfil</h1>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Volver al Panel</a>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          {/* Billing Section */}
          <BillingSection status={profile?.subscription_status} customerId={profile?.stripe_customer_id} />

          {/* Company Data */}
          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Datos de Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Razón Social</label>
                <input 
                  type="text" 
                  defaultValue={profile?.company_name || ''} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-success outline-none transition-all"
                  placeholder="Ej: Constructora S.A."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CIF / NIF</label>
                <input 
                  type="text" 
                  defaultValue={profile?.cif_nif || ''} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-success outline-none transition-all"
                  placeholder="Ej: A12345678"
                />
              </div>
            </div>
            <button className="mt-6 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded uppercase tracking-widest transition-all">
              Guardar Cambios
            </button>
          </section>

          {/* Digital Certificate Section */}
          <section className="rounded-xl border border-alert/20 bg-alert/5 p-6">
            <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Certificado Digital (XAdES-BES)</h2>
            <p className="text-sm text-gray-400 mb-6">
              Obligatorio para la firma legal de facturas. Formato aceptado: <span className="text-alert font-mono">.p12</span> o <span className="text-alert font-mono">.pfx</span>.
            </p>

            {profile?.certificate_path ? (
              <div className="flex items-center gap-4 bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="h-10 w-10 bg-success/20 rounded flex items-center justify-center text-success">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div>
                  <div className="text-success font-bold text-sm uppercase">Certificado Activo</div>
                  <div className="text-gray-400 text-xs">{profile.certificate_path.split('/').pop()}</div>
                </div>
                <button className="ml-auto text-xs text-alert font-bold uppercase hover:underline">Reemplazar</button>
              </div>
            ) : (
              <CertificateForm />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
