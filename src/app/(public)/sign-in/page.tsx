'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import setCookie from "./action"
import { redirect } from "next/navigation"
import { Figtree } from 'next/font/google'
import Image from "next/image"
import logoSinir from "../../../public/logo_sinir_negativa1.png"
import logoCaminhao from "../../../public/new-logo.png"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { LoginResponseI, ParceiroResponseI } from "@/interfaces/login.interface"
import { useState } from "react"
import { useQuery } from "react-query"
import { consultaParceiro } from "@/repositories/consultaParceiro"
import DialogParceiros from "@/components/dialogParceiros"
import { removerCaracteresNaoNumericos } from "@/utils/fnUtils"

const figtree = Figtree({ weight: '600', subsets: ['latin'] });

const userSchema = z.object({
  login: z.string()
    .min(11, {message: 'CPF inválido'})
    .transform(removerCaracteresNaoNumericos)
    .refine((val) => val.length === 11, {
      message: 'CPF deve conter 11 dígitos numéricos',
    })
    .refine((val) => /^\d{11}$/.test(val), {
      message: 'CPF inválido, deve conter apenas números'
    })
    ,
  senha: z.string().min(4, {
    message: 'Senha deve ter ao menos 4 caracteres'
  }),
  parCodigo: z.string().min(5, {
    message: "Unidade deve conter 5 dígitos"
  })
})

const unidadeSchema = z.object({
  cnpj: z.string()
    .min(1, { message: 'CNPJ é obrigatório' })
    .transform(removerCaracteresNaoNumericos)
    .refine((val) => val.length === 14, {
      message: 'CNPJ deve conter 14 dígitos numéricos',
    })
    .refine((val) => /^\d{14}$/.test(val), {
      message: 'CNPJ inválido, deve conter apenas números'
    })
})

type userSchema = z.infer<typeof userSchema>
type unidadeSchema = z.infer<typeof unidadeSchema>

export default function SignIn() {

  const { toast } = useToast()
  const [ acionarConsultaParceiros, setAcionarConsultaParceiros ] = useState<boolean>(false)
  
  const handleErrorMessage = (description :string)=> {
    toast({
      variant: "destructive",
      duration: 2000,
      description: <div className="flex items-center gap-2">
                     <span className="font-semibold">{description}</span>
                   </div>
    })
  }

  const handleSuccessfulMessage = (description :string)=> {
    toast({
      duration: 2000,
      description: <div className="flex items-center gap-2">
                      <span className="font-semibold">{description}</span>
                   </div>
    })
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<userSchema>({
    resolver: zodResolver(userSchema)
  })

  const {
    register: registerUnidade,
    handleSubmit: handleSubmitUnidade,
    formState: { errors: errorsUnidade },
    watch: watchUnidade,
    setError: setErrorUnidade,
    clearErrors: clearErrorsUnidade
  } = useForm<unidadeSchema>({
    resolver: zodResolver(unidadeSchema)
  })

  const formCnpj = watchUnidade("cnpj")

  const onSubmit = (data :userSchema)=> {
    handleLogin(data.login, data.senha, data.parCodigo)
  }

  const onSubmitUnidade = (data :unidadeSchema)=> {
    const result = unidadeSchema.pick({ cnpj: true }).safeParse(data)
    if(!result.success) {
      setAcionarConsultaParceiros(false)
      return
    }
    setAcionarConsultaParceiros(true)
  }

  const {
      data: parceiros,
      isLoading: isLoadingParceiros
  } = useQuery<ParceiroResponseI[], Error>(["consultaParceiro", acionarConsultaParceiros], async ()=> {
    const cnpjNumerico = formCnpj ? removerCaracteresNaoNumericos(formCnpj) : ""
    if(!cnpjNumerico || cnpjNumerico.length !== 14) {
      return []
    }
    return await consultaParceiro(cnpjNumerico)
  }, {
      refetchOnWindowFocus: false,
      enabled: !!formCnpj && removerCaracteresNaoNumericos(formCnpj).length === 14 && acionarConsultaParceiros,
      refetchOnMount: true,
      onSettled: (data, error)=> {
        // setAcionarConsultaParceiros(false)
        if(error) {
          handleErrorMessage("Erro ao consultar parceiros para o CNPJ informado.")
          setAcionarConsultaParceiros(false)
        } else if(data && data.length === 0) {
          handleErrorMessage("Nenhuma unidade encontrada para o CNPJ informado.")
          setAcionarConsultaParceiros(false)
        } else {
          clearErrorsUnidade("cnpj")
          setAcionarConsultaParceiros(true)
        }
      }
  })

  async function handleLogin(login :string, senha :string, parCodigo :string) {
    const response = await fetch("https://mtr.sinir.gov.br/api/mtr/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: login, senha: senha, parCodigo: parCodigo})
    })

    if (!response.ok) {
      const errorData = await response.json();

      handleErrorMessage(errorData.mensagem || "Erro ao tentar autenticar")

      return
    }

    const authenticatedUser = await response.json() as LoginResponseI

    handleSuccessfulMessage(`Olá, ${authenticatedUser.objetoResposta.paaNome}`)

    await setCookie(JSON.stringify(authenticatedUser))

    redirect('/gerador')
  }

  return (
    <main id="containerprincipal" className="flex items-stretch">  
      <div className="bg-[#00695C] flex-1 max-[1100px]:hidden">
        
        <div className="flex flex-col gap-3 w-full h-full items-center justify-center">
          <div className="flex gap-2 w-full items-center justify-center">
            <Image alt="" src={logoCaminhao} width={200} height={100}/>
            <Separator orientation="vertical" color="#FFF" />
            <Image alt="" src={logoSinir} width={150} height={80} />
          </div>
          
          <span className="text-gray-200 text-3xl font-bold">Gestão de Resíduos Integrada ao SINIR</span>
        </div>
      </div>

      

      <div className="flex-[560px_1_0] min-[1101px]:max-w-[560px] max-[1100px]:flex-1 flex-col h-full overflow-y-auto">

        <div className="relative h-[calc(100dvh)] bg-[#FFF] p-20 overflow-auto max-[1100px]:h-auto max-[1100px]:min-h-[calc(100dvh-16px)] custom-scrollbar"> {/*retirado do final  max-[1100px]:p-7*/}

          <h1 className={`font-bold text-black/80 text-2xl mt-16 ${figtree.className}`}>Acesse sua conta</h1>
          <p className="text-sm text-black/80 mb-12 max-md:mb-8">Utilize seus dados de login do SINIR</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-[100%]">

            <div className="flex flex-col items-start gap-2 text-gray-100">
              <label htmlFor="cnpj" className="font-sans text-black/80">CNPJ</label>
              <Input 
                id="cnpj"
                type="text"
                {...registerUnidade("cnpj")}
                placeholder="CNPJ"
                className={`bg-white text-black/80 outline-none ${errorsUnidade.cnpj && 'border-red-700 focus:border-red-700'} text-base placeholder:text-[17px] placeholder:text-gray-400 transition-colors h-12`} 
                onBlur={handleSubmitUnidade(onSubmitUnidade)}
              />
              { errorsUnidade.cnpj && <p className="text-red-700">{errorsUnidade.cnpj.message as string}</p> }
            </div>

            {isLoadingParceiros && (
              <p className="flex text-black/80 text-[17px] font-semibold font-sans bg-inherit h-12 mt-2 rounded-md items-center justify-center">Buscando unidades...</p>
            )}

            {
              parceiros && parceiros.length > 0 && !isLoadingParceiros && 
                <DialogParceiros listaDeParceiros={parceiros} setUnidadeSelecionada={setValue}/>
            }

            {
              parceiros && parceiros.length > 0 && !isLoadingParceiros &&
                <div className="flex flex-col items-start gap-2 text-gray-100">
                  <label htmlFor="parCodigo" className="font-sans text-black/80">Unidade</label>
                  <Input 
                    id="parCodigo"
                    readOnly
                    {...register('parCodigo')}
                    type="text" 
                    minLength={4}
                    placeholder="Código da unidade"
                    className={`bg-white text-black/80 outline-none ${errors.senha && 'border-red-700 focus:border-red-700'} text-base placeholder:text-[17px] placeholder:text-gray-400 transition-colors h-12`} 
                  />  
                  { errors.parCodigo && <p className="text-red-700">{errors.parCodigo.message as string}</p> }
                </div>
            }

            <div className="flex flex-col items-start gap-2">
              <label htmlFor="login" className="font-sans text-black/80">CPF</label>
              <Input
                id="login"
                {...register('login')}
                type="text" 
                placeholder="Seu CPF"
                className={`bg-white text-black/80 outline-none ${errors.login && 'border-red-700 focus:border-red-700'} text-base placeholder:text-[17px] placeholder:text-gray-400 transition-colors h-12`} 
              />
              { errors.login && <p className="text-red-700">{errors.login.message as string}</p> }
            </div>

            <div className="flex flex-col items-start gap-2 text-gray-100">
              <label htmlFor="senha" className="font-sans text-black/80">Senha</label>
              <Input 
                id="senha"
                {...register('senha')}
                type="password" 
                minLength={4}
                placeholder="Sua senha"
                className={`bg-white text-black/80 outline-none ${errors.senha && 'border-red-700 focus:border-red-700'} text-base placeholder:text-[17px] placeholder:text-gray-400 transition-colors h-12`} 
              />  
              { errors.senha && <p className="text-red-700">{errors.senha.message as string}</p> }
            </div>

            <Button 
              type="submit" 
              className="h-12 mt-6 text-[17px] font-sans bg-[#00695C] hover:bg-[#00695C]/80"
            >
              Entrar
            </Button>
          </form>

        </div>
      </div>
    </main>
  )
}
