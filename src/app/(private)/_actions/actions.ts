'use server'

import { cookies } from "next/headers"

export async function deleteCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('authCookie')
}

export async function getCookie() {
    const cookieStore = await cookies()
    const cookieValue = await cookieStore.get('authCookie')
    return JSON.parse(cookieValue?.value as string)
}