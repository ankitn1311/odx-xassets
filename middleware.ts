import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  // const token = request.cookies.get('auth_token') ? request.cookies.get('auth_token')?.value : '';
  const token = request.cookies.get('invite_code') ? request.cookies.get('invite_code')?.value : '';

  // if (request.nextUrl.pathname === '/') {
  //   console.log('======ROOT PAGE REDIRECT=====');
  //   return NextResponse.redirect(new URL('/x-assets', request.url));
  // }
  //

  // return NextResponse.next();

  if (!token && ['/', '/invite', '/x-assets'].includes(request.nextUrl.pathname)) {
    console.log('=====TOKEN NOT FOUND=====');
    if (request.nextUrl.pathname === '/invite') {
      console.log('=====TRADE PAGE=====');
      return NextResponse.next();
    }
    console.log('=====REDIRECT TO X-ASSETS PAGE=====');
    return NextResponse.redirect(new URL('/invite', request.url));
  }

  // if token is available and user tries to access protected routes
  if (token && ['/', '/invite', '/x-assets'].includes(request.nextUrl.pathname)) {
    try {
      if (request.nextUrl.pathname === '/invite' || request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/x-assets', request.url));
      }
      return NextResponse.next();
    } catch (error: any) {
      console.log('error', error);
      // const response = NextResponse.redirect(new URL("/", request.url));
      // response.cookies.delete("auth_token");
      // return response;
    }
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|images|static|_next/image|favicon.ico|public/*).*)',
    '/',
    '/invite',
    '/x-assets',
  ],
};
