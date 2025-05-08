'use client'

import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";
import { LoginResponseI } from "@/interfaces/login.interface";
import { getCookie } from "@/app/(private)/_actions/actions";

interface AuthProviderProps {
    children :ReactNode
}

interface AuthContextProps {
    token :string | undefined
    setToken :Dispatch<SetStateAction<string | undefined>>
    loginResponse :LoginResponseI | undefined
    setLoginResponse :Dispatch<SetStateAction<LoginResponseI | undefined>>
    initialize :()=> void
}

export const AuthContext = createContext({} as AuthContextProps)

export function AuthProvider({ children } :AuthProviderProps) {

    const [ token, setToken ] = useState<string>()
    const [ loginResponse, setLoginResponse ] = useState<LoginResponseI>()
    
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

    // useEffect(()=> {
    //     initialize()
    // }, [])

    return(
        <AuthContext.Provider value={{
            token, setToken, initialize,
            loginResponse, setLoginResponse
        }}>
            { children }
        </AuthContext.Provider>
    )
}