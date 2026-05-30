import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ExportButton from './export-button'

export default async function GestoriasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cargar clientes e información resumida de facturas
  const { data: clients } = await supabase
    .from('tenant_private_clients')
    .select(`
      *,
      invoices (
        id,
        invoice_number,
        total_amount,
        status,
        xml_path
      )
    `)
    .eq('tenant_id', user.id)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <h1 className="text-xl font-bold text-white">
            Portal <span className="text-success">Gestorías</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Volver al Panel</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Exportación Contable</h2>
            <p className="text-sm text-gray-400 mt-1">Descarga masiva de XMLs firmados (XAdES-BES) para integración en ERPs contables.</p>
          </div>
          <ExportButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients?.map((client: any) => {
            const invoicesCount = client.invoices?.length || 0
            const totalInvoiced = client.invoices?.reduce((acc: number, inv: any) => acc + Number(inv.total_amount), 0) || 0
            const hasXmls = client.invoices?.some((inv: any) => inv.xml_path !== null)

            return (
              <div key={client.id} className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-success/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px]" title={client.legal_name}>{client.legal_name}</h3>
                    <p className="text-xs font-mono text-gray-400">{client.cif}</p>
                  </div>
                  <div className="bg-white/10 text-xs font-bold px-2 py-1 rounded text-white">
                    {invoicesCount} facturas
                  </div>
                </div>
                
                <div className="space-y-1 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Volumen Facturado:</span>
                    <span className="text-white font-mono">{totalInvoiced.toFixed(2)} €</span>
                  </div>
                </div>

                {hasXmls ? (
                  <ExportButton clientId={client.id} clientName={client.legal_name} variant="secondary" />
                ) : (
                  <button disabled className="w-full bg-gray-500/20 text-gray-500 font-bold py-2 rounded text-xs uppercase tracking-widest cursor-not-allowed">
                    Sin XMLs disponibles
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
