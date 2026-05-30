"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AcceptInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verificando credenciales de acceso...');

  useEffect(() => {
    async function handleAccept() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Guardamos el token en session storage para volver tras el login
          sessionStorage.setItem('pending_invite_token', token);
          return router.push('/login');
        }

        // Llamada al backend para procesar la vinculación
        const res = await fetch('/api/firm/accept-invite', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ token })
        });

        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(`Vinculación completada. Ahora opera bajo el nodo de ${data.firmName}.`);
          setTimeout(() => router.push('/dashboard/company'), 3000);
        } else {
          throw new Error(data.error || 'Fallo al procesar la invitación');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message);
      }
    }
    handleAccept();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0E1117] text-white flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#161B22] border border-white/5 p-12 space-y-10 text-center shadow-2xl"
      >
        <div className="flex justify-center">
           {status === 'verifying' && <Loader2 className="w-12 h-12 text-[#00E676] animate-spin" />}
           {status === 'success' && <CheckCircle2 className="w-12 h-12 text-[#00E676]" />}
           {status === 'error' && <XCircle className="w-12 h-12 text-[#FF3D00]" />}
        </div>

        <div className="space-y-4">
           <h1 className="text-xl font-black uppercase tracking-widest italic">Vinculación de Nodo</h1>
           <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">
              {message}
           </p>
        </div>

        {status === 'error' && (
          <button 
            onClick={() => router.push('/dashboard/company')}
            className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#FF3D00] hover:text-white transition-all"
          >
            Volver al Terminal
          </button>
        )}
      </motion.div>
    </div>
  );
}
