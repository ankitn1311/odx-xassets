import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';
// import jwt from "jsonwebtoken";

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token') ? request.cookies.get('auth_token')?.value : '';

  if (
    [
      '/',
      '/authenticate',
      '/twitter_migrate',
      '/invite',
      '/score',
      '/trade',
      '/markets',
      '/portfolio',
      '/score',
      '/profile',
      '/components',
      '/profile/[username]',
      '/maintenance',
      '/swap',
    ].includes(request.nextUrl.pathname)
  )
    console.log('======PATH=====', request.nextUrl.pathname);
  // if user tries to access protected routes and token is not available
  // Under maintenance TODO: comment next two line to disable maintenance mode
  // if (request.nextUrl.pathname === '/maintenance') return NextResponse.next();
  // return NextResponse.redirect(new URL('/maintenance', request.url));

  /** handle case when not in maintenance mode but user go to maintenance, should be redirected to home '/' */
  // TEST
  // if (request.nextUrl.pathname === '/invite') {
  //   return NextResponse.next();
  // }

  if (request.nextUrl.pathname === 'twitter_migrate') {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === '/') {
    console.log('======ROOT PAGE REDIRECT=====');
    return NextResponse.redirect(new URL('/trade', request.url));
  }

  if (request.nextUrl.pathname === '/maintenance') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (
    !token &&
    [
      '/',
      '/invite',
      '/score',
      '/authenticate',
      '/trade',
      '/markets',
      '/portfolio',
      '/score',
      '/profile',
      '/components',
      // "/testnet/liquidity",
      // "/testnet/swap",
      // "/testnet/faucet",
      // "/testnet/withdraw",
      // "/testnet/stake",
      // "/testnet/wallet",
      // "/testnet/deposit",
      '/profile/[username]',
    ].includes(request.nextUrl.pathname)
  ) {
    console.log('=====TOKEN NOT FOUND=====');
    if (
      request.nextUrl.pathname === '/authenticate' &&
      request.nextUrl.search.startsWith('?token=')
    ) {
      return NextResponse.next();
    }
    if (request.nextUrl.pathname === '/trade') {
      console.log('=====TRADE PAGE=====');
      return NextResponse.next();
    }
    console.log('=====REDIRECT TO TRADE PAGE=====');
    return NextResponse.redirect(new URL('/trade', request.url));
  }

  // if token is available and user tries to access protected routes
  if (token) {
    console.log('=====TOKEN FOUND=====');
    try {
      const userInfo = decodeJwt(token!) as any;
      // if (!(userInfo.Version === "2")) {
      //   const newToken: string = await axios.get(`${baseURL}/auth2/reauth`, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   });
      //   // Cookies.set('auth_token', newToken);
      //   cookies().set("auth_token", newToken, {
      //     httpOnly: true,
      //     secure: true,
      //     expires: 7 * 24 * 60 * 60 * 1000, // 7 days
      //   });
      //   // Redirect to the same page with new token
      //   return NextResponse.redirect(request.nextUrl.clone());
      // }
      //

      console.log('=====USER INFO=====', {
        inviteCode: userInfo?.InviteCode,
        inviteCodeV2: userInfo?.InviteV2Code,
        isMigrated: userInfo?.IsMigrated,
      });

      /** 
        if user is in home or invite page that will be redirected from authentication
          */
      const inviteCodeAbsent = !userInfo?.InviteCode && !userInfo?.InviteV2Code;
      const inviteCodePresent = userInfo?.InviteCode || userInfo?.InviteV2Code;

      if (userInfo && ['/', '/authenticate', '/invite'].includes(request.nextUrl.pathname)) {
        if (inviteCodeAbsent && !userInfo?.IsMigrated) {
          console.log('=====INVITE CODE ABSENT=====');
          if (request.nextUrl.pathname === '/invite') {
            return NextResponse.next();
          }
          return NextResponse.redirect(new URL('/invite', request.url));
        }

        if (inviteCodePresent || userInfo?.IsMigrated) {
          console.log('=====INVITE CODE PRESENT=====');
          return NextResponse.redirect(new URL('/trade', request.url));
          // return NextResponse.next();
        }
      }

      if (userInfo && ['/score', '/profile/[username]'].includes(request.nextUrl.pathname)) {
        console.log('USER INFO PRESENT', '/score, /profile/[username]');
        if (inviteCodeAbsent && !userInfo?.IsMigrated) {
          return NextResponse.redirect(new URL('/invite', request.url));
        }

        if (inviteCodePresent || userInfo?.IsMigrated) {
          return NextResponse.next();
        }
      }

      if (userInfo && ['/swap'].includes(request.nextUrl.pathname)) {
        console.log('USER INFO PRESENT', 'swap');
        if (inviteCodeAbsent && !userInfo?.IsMigrated) {
          return NextResponse.redirect(new URL('/invite', request.url));
        }
        if (userInfo?.IsSwapWhitelisted || userInfo?.IsMigrated) {
          // console.log(userInfo?.IsSwapWhitelisted);
          return NextResponse.redirect(new URL('/trade', request.url));
        }
        return NextResponse.next();
      }

      if (
        userInfo &&
        ['/components', '/trade', '/markets', '/portfolio', '/score', '/profile'].includes(
          request.nextUrl.pathname
        )
      ) {
        console.log('=====MAIN ROUTES=====', inviteCodeAbsent);
        if (inviteCodeAbsent && !userInfo?.IsMigrated) {
          return NextResponse.redirect(new URL('/invite', request.url));
        }
        return NextResponse.next();
      }

      if (userInfo && request.nextUrl.pathname === '/invite') {
        console.log('=====USER INFO ON INVITE PAGE=====');
        if (userInfo?.IsMigrated || inviteCodePresent) {
          return NextResponse.redirect(new URL('/trade', request.url));
        }
        return NextResponse.next();
      }

      if (!userInfo && request.nextUrl.pathname === '/score') {
        console.log('=====NO USER INFO ON SCORE PAGE=====');
        return NextResponse.redirect(new URL('/trade', request.url));
      }

      console.log('=====NO USER INFO=====');
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
    '/authenticate',
    '/twitter_migrate',
    '/invite',
    '/score',
    '/swap',
    '/trade',
    '/markets',
    '/portfolio',
    '/score',
    '/profile',
    '/components',
    // "/testnet/liquidity",
    // "/testnet/swap",
    // "/testnet/faucet",
    // "/testnet/deposit",
    // "/testnet/withdraw",
    // "/testnet/stake",
    // "/testnet/wallet",
    '/profile/[username]',
    '/maintenance',
    // "/testnet/withdraw",
  ],
};
