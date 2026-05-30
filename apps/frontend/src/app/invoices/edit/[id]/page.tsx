"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  AlertCircle,
  FileEdit,
  ArrowRight,
  Plus,
  Trash2,
  Send,
  Loader2,
  Building2,
  Receipt,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/utils/cn";

interface LineItem {
  id: string;
  concept: string;
  quantity: number;
  unitPrice: string;
  taxPercentage: number;
  totalPrice: string;
}

export default function EditInvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [buyerData, setBuyerData] = useState<any>(null);
  const [items, setItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (!id) return;
    async function fetchInvoice() {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, client:tenant_private_clients(*)")
        .eq("id", id)
        .single();

      if (data) {
        setInvoice(data);
        setBuyerData(data.client);

        // Carga de conceptos de recuperación
        setItems([
          {
            id: "1",
            concept: data.concept || "Servicios Profesionales",
            quantity: 1,
            unitPrice: data.base_amount.toString(),
            taxPercentage: data.tax_percentage || 21,
            totalPrice: data.total_amount.toString(),
          },
        ]);
      }
      setLoading(false);
    }
    fetchInvoice();
  }, [id]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        concept: "",
        quantity: 1,
        unitPrice: "",
        taxPercentage: 21,
        totalPrice: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          if (field === "totalPrice") {
            const total = parseFloat(value as string) || 0;
            const base = total / (1 + newItem.taxPercentage / 100);
            newItem.unitPrice = (base / newItem.quantity).toFixed(6);
          }
          return newItem;
        }
        return item;
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      const cleanItems = items.map((i) => ({
        concept: i.concept,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        taxPercentage: Number(i.taxPercentage),
      }));

      // Generar la nueva factura rectificativa
      const res = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          clientId: invoice.client_id, // Reutilizamos el cliente
          items: cleanItems,
          buyer: {
            name: buyerData.company_name,
            cif: buyerData.cif_nif,
            address: buyerData.fiscal_address,
            city: buyerData.city || "Desconocido",
            zipCode: buyerData.zip_code || "00000",
            province: buyerData.province || "Desconocido",
            email: buyerData.email,
          },
        }),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(
          result.error || "Error al emitir la factura rectificativa",
        );

      // Marcar la factura vieja como "rectificada" (opcional pero recomendado)
      await supabase
        .from("invoices")
        .update({ status: "rectified" })
        .eq("id", id);

      router.push("/dashboard/company");
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0E1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#00E676] animate-spin" />
          <div className="text-[#00E676] font-black uppercase tracking-widest text-[10px]">
            Cargando Documento...
          </div>
        </div>
      </div>
    );

  if (!invoice)
    return (
      <div className="min-h-screen bg-[#0E1117] flex flex-col items-center justify-center p-6 text-center text-white">
        <AlertCircle className="w-16 h-16 text-gray-800 mb-4" />
        <h1 className="text-xl font-black uppercase tracking-tighter">
          Factura No Encontrada
        </h1>
        <button
          onClick={() => router.push("/dashboard/company")}
          className="mt-4 text-[#00E676] text-xs font-bold uppercase tracking-widest hover:underline"
        >
          Volver al Dashboard
        </button>
      </div>
    );

  const totals = items.reduce(
    (acc, item) => {
      const total = parseFloat(item.totalPrice || "0");
      const base = total / (1 + item.taxPercentage / 100);
      return {
        base: acc.base + base,
        tax: acc.tax + (total - base),
        total: acc.total + total,
      };
    },
    { base: 0, tax: 0, total: 0 },
  );

  return (
    <div className="min-h-screen bg-[#0E1117] text-white font-sans selection:bg-[#00E676] selection:text-black flex flex-col">
      <header className="border-b border-white/5 bg-[#0E1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Link
            href="/dashboard/company"
            className="flex items-center gap-2 group"
          >
            <div className="bg-white/5 p-2 group-hover:bg-white group-hover:text-black transition-all rounded-none">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-white transition-colors">
              CANCELAR
            </span>
          </Link>
          <div className="md:text-right">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-1">
              PROCESO DE SUBSANACIÓN
            </div>
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">
              Rectificar {invoice.invoice_number}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 py-12">
        {invoice.status === "rejected" && invoice.rejection_reason && (
          <div className="mb-12 border-l-4 border-[#FF3D00] bg-white/5 p-6 md:p-8 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-[#FF3D00] flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Motivo reportado por el cliente
              </div>
              <p className="text-sm md:text-base font-medium text-white italic leading-relaxed">
                "{invoice.rejection_reason}"
              </p>
              <p className="text-[10px] text-gray-500 mt-3 uppercase font-medium tracking-widest">
                Ajuste los conceptos para generar el documento rectificativo.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12 pb-56">
          {/* CLIENT DATA (LOCKED) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-300">
                Receptor (Sujeto Pasivo)
              </h2>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60 pointer-events-none">
              <div>
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                  Razón Social
                </div>
                <div className="text-lg font-black italic uppercase">
                  {buyerData?.legal_name}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                  NIF
                </div>
                <div className="text-lg font-mono font-bold uppercase">
                  {buyerData?.cif}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                  Dirección Registrada
                </div>
                <div className="text-sm font-bold uppercase text-gray-300">
                  {buyerData?.address}
                </div>
              </div>
            </div>
          </section>

          {/* INVOICE LINES (EDITABLE) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-gray-600" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-300">
                  Conceptos a Subsanar
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/5 border border-white/10 p-6 md:p-8 relative group"
                  >
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="absolute -right-3 -top-3 w-8 h-8 bg-black border border-white/20 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF3D00] hover:border-[#FF3D00]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-6 space-y-2">
                        <label className="text-[9px] font-black text-[#00E676] uppercase tracking-widest">
                          Concepto / Servicio
                        </label>
                        <input
                          type="text"
                          required
                          value={item.concept}
                          onChange={(e) =>
                            updateItem(item.id, "concept", e.target.value)
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-sm font-bold uppercase focus:border-[#00E676] outline-none transition-colors"
                          placeholder="Descripción detallada"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          IVA %
                        </label>
                        <select
                          value={item.taxPercentage}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "taxPercentage",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-sm font-mono focus:border-[#00E676] outline-none transition-colors appearance-none"
                        >
                          <option value={21}>21%</option>
                          <option value={10}>10%</option>
                          <option value={4}>4%</option>
                          <option value={0}>0%</option>
                        </select>
                      </div>

                      <div className="md:col-span-4 space-y-2">
                        <label className="text-[9px] font-black text-[#00E676] uppercase tracking-widest">
                          Total Línea (IVA incl.)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.totalPrice}
                            onChange={(e) =>
                              updateItem(item.id, "totalPrice", e.target.value)
                            }
                            className="w-full bg-white/10 border border-[#00E676]/30 rounded-none px-4 py-3 text-lg font-black focus:border-[#00E676] outline-none transition-colors"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#00E676]">
                            €
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={addItem}
                className="w-full border-2 border-dashed border-white/10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-[#00E676] hover:border-[#00E676]/30 hover:bg-[#00E676]/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Añadir Concepto
              </button>
            </div>
          </section>

          {/* SUBMIT AREA */}
          <section className="fixed bottom-0 left-0 w-full bg-[#0E1117]/95 backdrop-blur-xl border-t border-white/10 p-6 z-40">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
              <div className="grid grid-cols-2 md:flex items-end justify-between md:justify-start gap-4 md:gap-8 w-full md:w-auto">
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Base Imponible
                  </div>
                  <div className="text-lg md:text-xl font-mono text-white">
                    {totals.base.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                    })}
                    €
                  </div>
                </div>
                <div className="text-[#00E676] space-y-1 text-right md:text-left">
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-80">
                    IVA Total
                  </div>
                  <div className="text-lg md:text-xl font-mono">
                    +
                    {totals.tax.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                    })}
                    €
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1 pt-4 md:pt-0 mt-2 md:mt-0 border-t border-white/5 md:border-t-0 md:border-l md:border-white/10 md:pl-6 space-y-1">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Total Rectificado
                  </div>
                  <div className="text-4xl md:text-3xl font-black italic">
                    {totals.total.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                    })}
                    €
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto bg-white text-black px-12 py-5 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#00E676] transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Emitir Rectificativa
              </button>
            </div>
            {error && (
              <div className="max-w-5xl mx-auto mt-4 text-center text-[#FF3D00] text-[10px] font-black uppercase tracking-widest">
                {error}
              </div>
            )}
          </section>
        </form>
      </main>
    </div>
  );
}
