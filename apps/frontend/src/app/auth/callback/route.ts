import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_exchange_failed&msg=${encodeURIComponent(error.message)}`)
    }
    
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  const error_description = requestUrl.searchParams.get('error_description')
  if (error_description) {
    console.error(error_description);
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_no_code`)
}
