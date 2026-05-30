'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    
    // Obtenemos el origen dinámicamente para soportar ngrok, producción o localhost
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    
    console.log(`Iniciando OAuth con Google desde: ${origin}`);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirigimos al callback en el mismo dominio actual
        redirectTo: `${origin}/auth/callback`,
        // Forzamos la selección de cuenta para evitar logins automáticos no deseados
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    })
    
    if (error) {
      console.error('Error al iniciar OAuth:', error.message)
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleLogin}
      variant="outline"
      size="xl"
      disabled={loading}
      className="w-full rounded-none border-white/10 hover:border-white text-[10px] flex items-center justify-center gap-3 bg-white/5"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-none"></div>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      {loading ? 'CONECTANDO...' : 'ACCEDER CON GOOGLE'}
    </Button>
  )
}
