import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  // const token = request.cookies.get('auth_token') ? request.cookies.get('auth_token')?.value : '';
  //   // Under maintenance TODO: comment next two line to disable maintenance mode
  // if (request.nextUrl.pathname === '/maintenance') return NextResponse.next();
  // return NextResponse.redirect(new URL('/maintenance', request.url));
  const token = request.cookies.get('invite_code') ? request.cookies.get('invite_code')?.value : '';

  if (
    !token &&
    ['/', '/invite', '/x-assets', '/reserves', '/markets'].includes(request.nextUrl.pathname)
  ) {
    if (request.nextUrl.pathname === '/invite') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/invite', request.url));
  }

  // if token is available and user tries to access protected routes
  if (
    token &&
    ['/', '/invite', '/x-assets', '/reserves', '/markets'].includes(request.nextUrl.pathname)
  ) {
    try {
      if (request.nextUrl.pathname === '/invite' || request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/markets', request.url));
      }
      return NextResponse.next();
    } catch (error: any) {
      console.log('error', error);
      // const response = NextResponse.redirect(new URL("/", request.url));
      // response.cookies.delete("auth_token");
      // return response;
    }
  }
  if (request.nextUrl.pathname === '/maintenance') {
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
