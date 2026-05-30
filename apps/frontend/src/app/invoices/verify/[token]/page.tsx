"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Lock,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/utils/cn";

export default function VerifyInvoicePage() {
  const params = useParams();
  const token = params?.token;
  const supabase = createClient();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState<
    "idle" | "accepting" | "rejecting"
  >("idle");
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!token) return;

    async function fetchInvoice() {
      const { data, error } = await supabase
        .rpc("get_invoice_by_secure_token", { token_id: token })
        .single();

      if (data) {
        setInvoice({
          ...data.invoice_data,
          issuer: data.issuer_data,
          client: data.client_data,
        });
      }
      setLoading(false);
    }
    fetchInvoice();
  }, [token]);

  const handleAction = async (newStatus: "accepted" | "rejected") => {
    if (!token) return;

    if (newStatus === "rejected" && !rejectionReason.trim()) {
      setShowRejectReason(true);
      return;
    }

    setActionStatus(newStatus === "accepted" ? "accepting" : "rejecting");

    const { error } = await supabase.rpc("update_invoice_status_by_token", {
      token_id: token,
      new_status: newStatus,
      reason: newStatus === "rejected" ? rejectionReason : null,
    });

    if (!error) {
      setInvoice({
        ...invoice,
        status: newStatus,
        rejection_reason: rejectionReason,
      });
    }
    setActionStatus("idle");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-1 bg-gray-100 overflow-hidden relative">
            <motion.div
              animate={{ x: [-64, 64] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-black absolute top-0 left-0"
            />
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">
            AUTENTICANDO ACCESO
          </div>
        </div>
      </div>
    );

  if (!invoice)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-12 h-12 text-black mb-4" />
        <h1 className="text-xl font-black uppercase tracking-tighter italic">
          DOCUMENTO NO ENCONTRADO
        </h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 max-w-xs leading-loose">
          El enlace de seguridad es inválido o el acceso ha sido revocado.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0E1117] font-sans selection:bg-black selection:text-[#00E676]">
      <header className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-black tracking-tighter italic leading-none">
              FACTURA<span className="text-[#00E676]">AI</span>
            </div>
            <div className="h-6 w-[1px] bg-gray-100 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Portal de Gestión B2B
              </span>
            </div>
          </div>
          <img
            src="https://www.agenciatributaria.es/static_files/AEAT/Contenidos_Comunes/La_Agencia_Tributaria/Verifactu/logo_verifactu.png"
            alt="Verifactu Logo"
            className="h-8 object-contain opacity-80"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-black shadow-[40px_40px_80px_-20px_rgba(0,0,0,0.05)] p-12 md:p-20 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24 pb-12 border-b border-gray-100">
                <div className="space-y-8 flex-1">
                  <div>
                    <div className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.4em] mb-4">
                      ENTIDAD EMISORA
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-4">
                      {invoice.issuer?.company_name}
                    </h1>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                        <ShieldCheck className="w-3.5 h-3.5 text-black" />
                        NIF: {invoice.issuer?.cif_nif}
                      </div>
                      <div className="flex items-start gap-2 text-[11px] font-medium text-gray-400 uppercase tracking-tight leading-relaxed max-w-sm">
                        <Building2 className="w-3.5 h-3.5 mt-0.5 text-black flex-shrink-0" />
                        {invoice.issuer?.fiscal_address}
                      </div>
                    </div>
                  </div>
                </div>
                {invoice.issuer?.logo_url ? (
                  <img
                    src={invoice.issuer.logo_url}
                    alt="Logo"
                    className="h-24 object-contain contrast-125 border border-gray-50 p-2"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-4xl text-gray-200 uppercase italic">
                    {invoice.issuer?.company_name?.substring(0, 2)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 text-black">
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    Referencia Factura
                  </span>
                  <div className="text-xl font-black font-mono">
                    {invoice.invoice_number}
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    Fecha de Expedición
                  </span>
                  <div className="text-xl font-black italic">
                    {invoice.issue_date}
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    Fecha Vencimiento
                  </span>
                  <div className="text-xl font-black italic">
                    {invoice.due_date || "--"}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-24">
                <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 pl-1">
                  Concepto de Facturación
                </div>
                <div className="border border-black p-6 md:p-10 bg-[#FAFAFA] text-black">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-12">
                    <div className="space-y-3 w-full md:w-auto">
                      <h3 className="text-base md:text-lg font-black uppercase tracking-tight leading-snug italic break-words">
                        {invoice.concept || "Servicios Profesionales"}
                      </h3>
                      <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                        Sujeto a IVA 21%
                      </div>
                    </div>
                    <div className="text-left md:text-right w-full md:w-auto pt-4 md:pt-0 border-t border-gray-200 md:border-0">
                      <div className="text-xl md:text-2xl font-black italic tracking-tighter">
                        {Number(invoice.total_amount).toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        €
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-16 border-t-2 border-black flex flex-col md:flex-row justify-between items-end gap-12 text-black">
                <div className="w-full md:w-auto">
                  <div className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.4em] mb-2">
                    Importe Total Liquidación
                  </div>
                  <div className="text-7xl font-black italic tracking-tighter uppercase leading-none">
                    {Number(invoice.total_amount).toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                    })}
                    <span className="text-3xl not-italic ml-2 text-gray-200">
                      €
                    </span>
                  </div>
                </div>
                <div className="bg-black text-white px-10 py-8 text-center space-y-2 min-w-[260px]">
                  <div className="text-[9px] font-black opacity-40 uppercase tracking-[0.3em]">
                    Base Imponible
                  </div>
                  <div className="text-3xl font-black italic tracking-tighter text-[#00E676]">
                    {Number(invoice.base_amount).toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black">
              <button className="group flex items-center justify-between border-2 border-black bg-white p-8 transition-all hover:bg-black hover:text-white">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gray-50 group-hover:bg-white/10 transition-colors">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest">
                      Descargar Copia PDF
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 group-hover:text-white/40 uppercase tracking-tight mt-1">
                      Copia visual firmada
                    </div>
                  </div>
                </div>
              </button>
              <button className="group flex items-center justify-between border-2 border-black bg-white p-8 transition-all hover:bg-black hover:text-white">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gray-50 group-hover:bg-white/10 transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest">
                      Descargar Facturae XML
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 group-hover:text-white/40 uppercase tracking-tight mt-1">
                      Estructura oficial 3.2.2
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 text-black">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-black p-10 shadow-[20px_20px_0px_#00E676]/5"
            >
              <div className="flex items-center gap-3 mb-12 pb-6 border-b border-gray-100">
                <Clock className="w-5 h-5 text-black" />
                <div className="text-[10px] font-black text-black uppercase tracking-[0.3em]">
                  Estado de Conformidad
                </div>
              </div>

              {invoice.status === "sent" ? (
                <div className="space-y-6">
                  {!showRejectReason ? (
                    <>
                      <div className="bg-orange-50/80 p-8 border-l-4 border-orange-500 text-center mb-10">
                        <div className="text-[11px] font-black text-orange-600 uppercase tracking-widest mb-2 italic animate-pulse">
                          Pendiente de Revisión
                        </div>
                      </div>
                      <button
                        onClick={() => handleAction("accepted")}
                        disabled={actionStatus !== "idle"}
                        className="w-full bg-[#00E676] text-black py-6 text-[12px] font-black uppercase tracking-[0.4em] hover:shadow-[0_20px_50px_rgba(0,230,118,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                      >
                        {actionStatus === "accepting" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                        ACEPTAR FACTURA
                      </button>
                      <button
                        onClick={() => setShowRejectReason(true)}
                        disabled={actionStatus !== "idle"}
                        className="w-full bg-white border-2 border-black text-black py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        REPORTAR DISCREPANCIA
                      </button>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-6"
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest text-red-600">
                        Motivo del Rechazo
                      </div>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Describa el error o motivo del rechazo..."
                        className="w-full min-h-[120px] border border-black bg-gray-50 p-4 text-xs font-bold uppercase tracking-tight outline-none focus:bg-white transition-all"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction("rejected")}
                          disabled={
                            !rejectionReason.trim() || actionStatus !== "idle"
                          }
                          className="flex-1 bg-black py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600 disabled:opacity-30 transition-colors"
                        >
                          ENVIAR RECHAZO
                        </button>
                        <button
                          onClick={() => setShowRejectReason(false)}
                          className="bg-gray-100 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-200 transition-colors"
                        >
                          VOLVER
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div
                    className={cn(
                      "w-24 h-24 mx-auto flex items-center justify-center mb-8 border-4 shadow-xl",
                      invoice.status === "accepted"
                        ? "bg-white border-[#00E676] text-[#00E676]"
                        : "bg-white border-[#FF3D00] text-[#FF3D00]",
                    )}
                  >
                    {invoice.status === "accepted" ? (
                      <CheckCircle2 className="w-14 h-14" />
                    ) : (
                      <XCircle className="w-14 h-14" />
                    )}
                  </div>
                  <div className="text-xl font-black uppercase italic tracking-tighter text-black">
                    FACTURA{" "}
                    {invoice.status === "accepted" ? "ACEPTADA" : "RECHAZADA"}
                  </div>
                  {invoice.status === "rejected" && (
                    <p className="mt-6 px-4 text-[10px] font-bold uppercase tracking-widest text-red-600 italic">
                      " {invoice.rejection_reason} "
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-6 leading-relaxed font-bold uppercase tracking-[0.2em] px-4">
                    {invoice.status === "accepted"
                      ? "El acuse de recibo ha sido notificado al emisor."
                      : "Se ha enviado la notificación de rechazo al emisor."}
                  </p>
                </div>
              )}
            </motion.div>

            <div className="bg-black text-white p-10 space-y-6">
              <div className="flex items-center gap-4 text-[#00E676]">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                  Auditoría Digital
                </span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-bold tracking-tight">
                ESTE DOCUMENTO HA SIDO VALIDADO POR LA INFRAESTRUCTURA DE
                SEGURIDAD DE <span className="text-[#00E676]">FACTURAI</span>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto py-24 px-8 border-t border-black/5 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">
          SISTEMA DE INTEROPERABILIDAD FISCAL // 2026
        </p>
      </footer>
    </div>
  );
}
