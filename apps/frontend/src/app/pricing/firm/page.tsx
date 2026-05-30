"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ArrowRight,
  Cpu,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function FirmPricingPage() {
  const [seats, setSeats] = useState(10);

  const calculatePricePerSeat = (count: number) => {
    if (count <= 25) return 35;
    if (count <= 50) return 25;
    if (count <= 200) return 15;
    return 10;
  };

  const pricePerSeat = calculatePricePerSeat(seats);
  const totalMonthly = seats * pricePerSeat;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0E1117] font-sans text-white selection:bg-[#00E676] selection:text-black antialiased">
      {/* HEADER MINIMALISTA */}
      <nav className="flex items-center justify-between border-b border-white/5 p-6 md:p-8 lg:px-24">
        <Link href="/dashboard/firm" className="group flex items-center gap-4">
          <ChevronLeft className="h-5 w-5 text-slate-500 transition-colors group-hover:text-[#00E676]" />
          <span className="text-sm font-black uppercase tracking-[0.4em]">
            Panel
          </span>
        </Link>
        <span className="text-xl font-bold italic uppercase tracking-tighter">
          Factur<span className="text-[#00E676]">AI</span> Partners
        </span>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-16 md:py-40 lg:px-24">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-32">
          {/* LEFT: CALCULATOR */}
          <div className="space-y-12 md:space-y-16">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 border border-[#00E676]/20 bg-[#00E676]/10 px-4 py-2">
                <Cpu className="h-4 w-4 text-[#00E676]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E676]">
                  Escalado Industrial
                </span>
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter md:text-8xl">
                Suministro <br className="hidden md:block" /> por Volumen.
              </h1>
              <p className="mx-auto max-w-lg text-xl font-medium leading-relaxed text-slate-500 lg:mx-0">
                Optimice su rentabilidad. Cuanto mayor sea el número de asientos
                desplegados, menor será el coste unitario por licencia.
              </p>
            </div>

            <div className="relative space-y-10 border border-white/10 bg-[#161B22] p-8 shadow-2xl md:space-y-12 md:p-12">
              <div className="pointer-events-none absolute right-0 top-0 hidden p-8 opacity-[0.03] md:block text-white">
                <TrendingDown className="h-48 w-48" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-[10px] font-black uppercase italic tracking-[0.2em] text-slate-500 md:tracking-[0.5em]">
                    Despliegue de Nodo
                  </span>
                  <span className="whitespace-nowrap text-3xl font-black italic md:text-4xl">
                    {seats} Slots
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="1"
                  value={seats}
                  onChange={(e) => setSeats(parseInt(e.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-none bg-white/10 accent-[#00E676]"
                />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-700">
                  <span>Mínimo 10</span>
                  <span>Máximo 500+</span>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-8 border-t border-white/5 pt-8 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Precio / Licencia
                  </div>
                  <div className="text-4xl font-black italic text-[#00E676] md:text-5xl text-white">
                    {pricePerSeat}€
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Inversión Mensual
                  </div>
                  <div className="text-4xl font-black italic text-white md:text-5xl">
                    {totalMonthly.toLocaleString("es-ES")}€
                  </div>
                </div>
              </div>

              <button className="group flex w-full items-center justify-center gap-4 bg-white py-6 text-[11px] font-black uppercase tracking-[0.4em] text-black transition-all hover:bg-[#00E676] md:py-8">
                Reservar Capacidad{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2 md:h-5 md:w-5" />
              </button>
            </div>
          </div>

          {/* RIGHT: TIER INFO */}
          <div className="space-y-12 md:space-y-16">
            <div className="border-b border-white/5 pb-8 text-[11px] font-black uppercase tracking-[0.8em] text-slate-700">
              Requisitos de Partner
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-medium uppercase leading-loose tracking-widest text-slate-500">
                Este plan es exclusivo para{" "}
                <strong className="text-white">Despachos y Gestorías</strong>.
                Requiere compromiso de flota y acreditación profesional
                durante el alta.
              </p>
              <div className="h-px w-full bg-white/5"></div>
            </div>

            <div className="space-y-4 md:space-y-6">
              {[
                {
                  range: "10 - 25",
                  price: "35€",
                  desc: "Compromiso mínimo para partners.",
                  active: seats <= 25,
                },
                {
                  range: "26 - 50",
                  price: "25€",
                  desc: "Despachos en expansión digital.",
                  active: seats > 25 && seats <= 50,
                },
                {
                  range: "51 - 200",
                  price: "15€",
                  desc: "Escala corporativa con soporte.",
                  active: seats > 50 && seats <= 200,
                },
                {
                  range: "201+",
                  price: "10€",
                  desc: "Tarifa industrial de flota.",
                  active: seats > 200,
                },
              ].map((tier, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between border p-6 transition-all md:p-8",
                    tier.active
                      ? "scale-[1.02] border-white bg-white text-black shadow-2xl md:scale-105"
                      : "border-white/5 bg-transparent opacity-40 grayscale",
                  )}
                >
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest md:text-xs">
                      {tier.range} CLIENTES
                    </div>
                    <p className="text-[8px] font-bold uppercase tracking-tight md:text-[9px]">
                      {tier.desc}
                    </p>
                  </div>
                  <div className="text-3xl font-black italic tracking-tighter md:text-4xl text-white group-active:text-black">
                    {tier.price}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6 border border-[#00E676]/20 bg-[#00E676]/5 p-8">
              <CheckCircle2 className="h-8 w-8 text-[#00E676] flex-shrink-0" />
              <p className="text-[10px] font-bold uppercase leading-loose tracking-widest text-slate-400">
                Todas las licencias incluyen{" "}
                <strong className="text-white">HANDSHAKE AEAT</strong> ilimitado
                y acceso a la API de{" "}
                <strong className="text-white">CONCILIACIÓN BANCARIA</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
