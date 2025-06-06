'use client'

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";
import { LoginResponseI } from "@/interfaces/login.interface";
import { deleteCookie, getCookie } from "@/app/(private)/_actions/actions";

interface AuthProviderProps {
    children :ReactNode
}

interface AuthContextProps {
    token :string | undefined
    setToken :Dispatch<SetStateAction<string | undefined>>
    loginResponse :LoginResponseI | undefined
    setLoginResponse :Dispatch<SetStateAction<LoginResponseI | undefined>>
    initialize :()=> void
    logout :()=> void
}

export const AuthContext = createContext({} as AuthContextProps)

export function AuthProvider({ children } :AuthProviderProps) {

    const [ token, setToken ] = useState<string>()
    const [ loginResponse, setLoginResponse ] = useState<LoginResponseI>()

    const logout = useCallback(async ()=> {
        await deleteCookie()
        setToken(undefined)
        setLoginResponse(undefined)
    }, [])
    
    function initialize() {
        getCookie()
        .then(tokenData => {
            if(tokenData) {
                setLoginResponse(tokenData)
                setToken(tokenData.objetoResposta.token)
            }
        })
        .catch(error => {
            console.error(error)
        })
    }

    return(
        <AuthContext.Provider value={{
            token, setToken, initialize, logout,
            loginResponse, setLoginResponse
        }}>
            { children }
        </AuthContext.Provider>
    )
}