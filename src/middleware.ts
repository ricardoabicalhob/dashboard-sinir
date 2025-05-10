import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { LoginResponseI } from "./interfaces/login.interface";

const publicRoutes = [
  { path: '/sign-in', whenauthenticated: 'redirect' },
] as const;

const protectedRoutesConfig = [
  { path: '/gerador', permissionKey: 'isGerador' },
  { path: '/destinador', permissionKey: 'isDestinador' },
  { path: '/armazenador-temporario', permissionKey: 'isArmazenadorTemporario' },
  { path: '/movimentacao-para-o-destinador-final', permissionKey: 'isMovimentacaoDestinadorFinal' },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/sign-in';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const publicRoute = publicRoutes.find(route => route.path === path);
    const protectedRoutes = protectedRoutesConfig.find(route => route.path === path)
    const cookie = request.cookies.get('authCookie');
    const authTokenString = cookie?.value || "";
    let authToken: LoginResponseI | null = null;

    try {
        authToken = JSON.parse(authTokenString);
    } catch (error) {
        authToken = null;
        console.error(error)
    }

    if (!authToken && publicRoute) {
        return NextResponse.next();
    }

    if (!authToken && !publicRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
        return NextResponse.redirect(redirectUrl);
    }

    if (authToken && publicRoute && publicRoute.whenauthenticated === 'redirect') {
        const objetoResposta = authToken.objetoResposta
        const newObjetoResposta = {...objetoResposta, isMovimentacaoDestinadorFinal: true}
        const firstAllowedRoute = protectedRoutesConfig.find(route => newObjetoResposta[route.permissionKey] === true)?.path;

        if (firstAllowedRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = firstAllowedRoute;
        return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    if (authToken && protectedRoutes) {
        const matchedProtectedRoute = protectedRoutesConfig.find(route => route.path === path);

        if (matchedProtectedRoute) {
            const permissionKey = matchedProtectedRoute.permissionKey;
            const objetoResposta = authToken.objetoResposta
            const newObjetoResposta = {...objetoResposta, isMovimentacaoDestinadorFinal: true}
            const hasPermission = newObjetoResposta[permissionKey];

            if (hasPermission === true) {
                return NextResponse.next();
            } else {
                const objetoResposta = authToken.objetoResposta
                const newObjetoResposta = {...objetoResposta, isMovimentacaoDestinadorFinal: true}
                const firstAllowedRoute = protectedRoutesConfig.find(route => newObjetoResposta[route.permissionKey] === true)?.path;
                if (firstAllowedRoute) {
                    const redirectUrl = request.nextUrl.clone();
                    redirectUrl.pathname = firstAllowedRoute;
                    return NextResponse.redirect(redirectUrl);
                }
                return NextResponse.next();
            }
        }
    }

    if (authToken && !publicRoute && !protectedRoutes) {
        if (authToken) {
            const objetoResposta = authToken.objetoResposta
            const newObjetoResposta = {...objetoResposta, isMovimentacaoDestinadorFinal: true}
            const firstAllowedRoute = protectedRoutesConfig.find(route => newObjetoResposta[route.permissionKey] === true)?.path
            if (firstAllowedRoute) {
                const redirectUrl = request.nextUrl.clone()
                redirectUrl.pathname = firstAllowedRoute
                return NextResponse.redirect(redirectUrl)
            }
        }
        return NextResponse.next()
    }
}

export const config: MiddlewareConfig = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}