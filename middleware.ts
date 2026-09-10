import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { REQUIRE_LAUNCH_PASSWORD } from '@/config/access';

// App routes that need the access cookie when the gate is on. The landing page at "/"
// is always public; "Launch App" on it sets the cookie after the password check.
const GATED = ['/x-assets', '/reserves', '/markets'];

export default async function middleware(request: NextRequest) {
  // Under maintenance TODO: uncomment next two lines to enable maintenance mode
  // if (request.nextUrl.pathname === '/maintenance') return NextResponse.next();
  // return NextResponse.redirect(new URL('/maintenance', request.url));
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('invite_code')?.value ?? '';

  // The old invite page is replaced by the password dialog on the landing page.
  if (pathname === '/invite') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (REQUIRE_LAUNCH_PASSWORD && !token && GATED.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname === '/maintenance') {
    return NextResponse.redirect(new URL('/markets', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|images|static|_next/image|favicon.ico|public/*).*)',
    '/',
    '/invite',
    '/reserves',
    '/markets',
    '/x-assets',
    '/maintenance',
  ],
};
