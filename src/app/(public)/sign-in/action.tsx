'use server'

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export default async function setCookie(token: string) {

  const cookieOptions = {
    path: '/',
    maxAge: 60 * 60 * 24 * 1,
    httpOnly: true,
    secure: true
  }
  
  try {
    const cookieStore = await cookies();
    cookieStore.set('authCookie', JSON.stringify(token), cookieOptions)
  } catch (error) {
    console.error('Error setting cookie:', error);
    return NextResponse.json({ message: 'Error setting cookie' }, { status: 500 });
  }
}