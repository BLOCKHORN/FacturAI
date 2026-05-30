import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and getUser. A simple mistake
  // could make it very hard to debug issues with sessions being lost.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isLoginRoute = request.nextUrl.pathname.startsWith('/login')
  const isPublicRoute = 
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname.startsWith('/invoices/verify/')

  if (!user && !isAuthRoute && !isLoginRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'company'
    const path = request.nextUrl.pathname

    if (isLoginRoute) {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role}`
      return NextResponse.redirect(url)
    }

    if (path.startsWith('/dashboard/')) {
      if (role === 'company' && path.startsWith('/dashboard/gestoria')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/company'
        return NextResponse.redirect(url)
      }
      if (role === 'gestoria' && path.startsWith('/dashboard/company')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/gestoria'
        return NextResponse.redirect(url)
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally: return myNewResponse, or else!
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
