'use client'

import "./../globals.css";
import { QueryClientProvider } from "react-query";
import { queryClient } from "@/services/queryClient";
import { redirect, usePathname } from "next/navigation";
import { useContext, useEffect, useRef } from "react";
import DateRangePicker from "@/components/dateRangePicker";
import { SystemContext, SystemProvider } from "@/contexts/system.context";
import { AuthContext } from "@/contexts/auth.context";
import { LoginResponseI } from "@/interfaces/login.interface";
import Image from "next/image";
import logoGestao from "../../public/new-logo-2-com-texto.png"
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";

interface MenuBarProps {
  loginResponse :LoginResponseI | undefined
}

function MenuBar({ loginResponse } :MenuBarProps) {

  const { logout, initialize } = useContext(AuthContext)
  const infoUnidadeRef = useRef<HTMLDivElement>(null)

  async function handleDisconnect() {
    await logout()
    redirect('/sign-in')
  }

  useEffect(()=> {
    setTimeout(() => {
      if (infoUnidadeRef.current) {
        infoUnidadeRef.current.classList.remove("opacity-0");
        infoUnidadeRef.current.classList.add("opacity-100");
      }
    }, 1500)
    initialize()
  }, [])

  return(
    <nav aria-label="Menu de navegação desktop" className="hidden overflow-x-clip border-b border-gray-200 xl:block bg-[#00695C]">
      <div className="relative">
        <ul aria-orientation="horizontal" className="mx-auto hidden max-w-[120rem] items-center justify-between p-1 text-sm xl:flex xl:px-5">
          <li className="flex items-center gap-5 divide-x divide-[#FFFFFF70]">
            <ul className="flex items-center text-gray-200 transition-colors">
              <Image alt="" src={logoGestao} width={140} height={80} />
            </ul>
            <ul className="flex items-stretch gap-2 px-5">
              { loginResponse &&
                <div ref={infoUnidadeRef} className={`flex flex-col opacity-0 transition-opacity duration-1000`}>
                  <span className="text-white font-bold">{`${loginResponse?.objetoResposta.parCodigo} - ${loginResponse?.objetoResposta.parDescricao}`}</span>
                  <span className="text-white/70 text-xs">{`Usuário: ${loginResponse?.objetoResposta.paaCpf} - ${loginResponse?.objetoResposta.paaNome}`}</span>
                  <span className="text-white/70 text-xs">{`Perfil: ${loginResponse?.objetoResposta.gerador? "/Gerador" :""}${loginResponse?.objetoResposta.destinador? "/Destinador" :""}${loginResponse?.objetoResposta.armazenadorTemporario? "/Armazenador Temporário" :""}`}</span>
                </div>}
            </ul>
            
          </li>
            <div 
              className="bg-[#00BCD4] hover:filter hover:brightness-110 flex justify-end rounded-full shadow-md shadow-black/40 p-2 text-white font-semibold select-none cursor-pointer"
              onClick={()=> handleDisconnect()}  
            >
              <span className="material-symbols-outlined">exit_to_app</span>
              {/* <LogOut /> */}
            </div>
        </ul>

      </div>
    </nav>
  )
}



interface SubMenuBarProps {
  perfil :{
    gerador :boolean,
    armazenadorTemporario :boolean,
    destinador :boolean
  }
}

function SubMenuBar({ perfil } :SubMenuBarProps) {
  const pathname = usePathname()
  const {
      dateRange, setDateRange
  } = useContext(SystemContext)

  return(
    <div className="flex items-center px-2 border-b border-b-gray-200 divide-x divide-gray-300 h-12 w-full bg-white">
      <DateRangePicker dateRange={dateRange} setDateRange={setDateRange}/>

      { perfil.gerador &&
        (pathname === "/gerador" ?
        <span className="text-[#00695C] font-normal leading-relaxed px-2 select-none">Gerador</span> :
        <Link href="/gerador" className="font-light px-2">Gerador</Link>) }
      
      { perfil.armazenadorTemporario &&
        (pathname === "/armazenador-temporario" ?
        <span className="text-[#00695C] font-normal leading-relaxed px-2 select-none">Armazenador Temporário</span> :
        <Link href="/armazenador-temporario" className="font-light px-2">Armazenador Temporário</Link>) }
      
      { perfil.destinador &&
        (pathname === "/destinador" ?
        <span className="text-[#00695C] font-normal leading-relaxed select-none px-2">Destinador</span> :
        <Link href="/destinador" className="font-light px-2">Destinador</Link>) }

      { perfil.gerador && perfil.armazenadorTemporario &&
        (pathname === "/movimentacao-para-o-destinador-final" ?
        <span className="text-[#00BCD4] font-normal leading-relaxed select-none pl-2">Movimentação para o destinador final</span> :
        <Link href="/movimentacao-para-o-destinador-final" className="font-light pl-2">Movimentação para o destinador final</Link>  
        ) }

      { !perfil.destinador && !perfil.armazenadorTemporario &&
        (pathname === "/movimentacao-gerador-para-o-armazenador-temporario" ?
        <span className="text-[#00BCD4] font-normal leading-relaxed select-none px-2">Minhas movimentações para o armazenamento temporário</span> :
        <Link href="/movimentacao-gerador-para-o-armazenador-temporario" className="font-light px-2">Minhas movimentações para o armazenamento temporario</Link>  
        ) }

      { !perfil.destinador && !perfil.armazenadorTemporario &&
        (pathname === "/movimentacao-gerador-para-o-destinador-final" ?
        <span className="text-[#00BCD4] font-normal leading-relaxed select-none pl-2">Minhas movimentações para o destinador final</span> :
        <Link href="/movimentacao-gerador-para-o-destinador-final" className="font-light pl-2">Minhas movimentações para o destinador final</Link>  
        ) }      
    </div>
  )
}


export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { loginResponse } = useContext(AuthContext)

  return (
    <html lang="pt-BR">
      <body 
          className={`antialiased`}
      >
        <SystemProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <MenuBar loginResponse={loginResponse} />
              <SubMenuBar perfil={{
                gerador: loginResponse?.objetoResposta.isGerador || false, 
                armazenadorTemporario: loginResponse?.objetoResposta.isArmazenadorTemporario || false, 
                destinador: loginResponse?.objetoResposta.isDestinador || false
              }}/>
              {children}
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </SystemProvider>
      </body>
    </html>
  )
}
