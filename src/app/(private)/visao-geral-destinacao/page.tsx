'use client'

import CustomMessage from "@/components/customMessage"
import DialogListMTR from "@/components/dialogListMTR"
import GraficoBarraDupla from "@/components/graficoBarraDupla"
import { AuthContext } from "@/contexts/auth.context"
import { SystemContext } from "@/contexts/system.context"
import { LoginResponseI } from "@/interfaces/login.interface"
import { MTRResponseI } from "@/interfaces/mtr.interface"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filterEverythingWithDateReceivedWithinThePeriod, groupByWasteType } from "@/utils/fnFilters"
import { formatDateDDMMYYYYForMMDDYYYY, formatDateForAPI, totalizeEstimated, totalizeReceived } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { Info } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function VisaoGeralPage() {

    const { 
        token,
        loginResponse
    } = useContext(AuthContext)
    const [ dateFrom, setDateFrom ] = useState<Date>(new Date(formatDateDDMMYYYYForMMDDYYYY(subDays(new Date(Date.now()), 30).toLocaleDateString()) || ""))
    const [ dateTo, setDateTo ] = useState<Date>(new Date(formatDateDDMMYYYYForMMDDYYYY(new Date(Date.now()).toLocaleDateString()) || ""))
    const dateFromBefore = subDays(dateFrom, 90)
    const dateToBefore = subDays(dateFrom, 1)
    const dateFromBeforeBefore = subDays(dateFromBefore, 90)
    const dateToBeforeBefore = subDays(dateFromBefore, 1)
    const [ profile, setProfile ] = useState<LoginResponseI>()

    const {
        dateRange
    } = useContext(SystemContext)

    useEffect(()=> {
        if(dateRange) {
            setDateFrom(new Date(formatDateDDMMYYYYForMMDDYYYY(dateRange.from?.toLocaleDateString() || "") || ""))
            setDateTo(new Date(formatDateDDMMYYYYForMMDDYYYY(dateRange.to?.toLocaleDateString() || "") || ""))
        }
    }, [dateRange])

    useEffect(()=> {
        if(!profile) {
            setProfile(loginResponse)
        }
    }, [loginResponse])




    const { 
        data: referencePeriodListGerador, 
        isSuccess: isSuccessListGerador,
        isError: isErrorListGerador,
        error: errorListGerador
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsGerador', 1, dateFrom], 
        async ()=> await getMtrList("Gerador", formatDateForAPI(dateFrom), formatDateForAPI(dateTo), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile, 
    })
    
    const {
        data: extendedPeriodListGerador,
        isSuccess: isSuccessListExtentedGerador,
        isError: isErrorListExtentedGerador,
        error: errorListExtentedGerador
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsGerador', 2, dateFromBefore], 
        async ()=> await getMtrList("Gerador", formatDateForAPI(dateFromBefore), formatDateForAPI(dateToBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
        }
    )

    const {
        data: extendedPeriodListMoreGerador,
        isSuccess: isSuccessListExtentedMoreGerador,
        isError: isErrorListExtentedMoreGerador,
        error: errorListExtentedMoreGerador
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsGerador', 3, dateFromBeforeBefore], 
        async ()=> await getMtrList("Gerador", formatDateForAPI(dateFromBeforeBefore), formatDateForAPI(dateToBeforeBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
        }
    )
    
    const allMtrsGerador = useMemo(() => {
        if (referencePeriodListGerador && extendedPeriodListGerador && extendedPeriodListMoreGerador) {
            return [...referencePeriodListGerador, ...extendedPeriodListGerador, ...extendedPeriodListMoreGerador];
        }
        if (referencePeriodListGerador) {
            return referencePeriodListGerador;
        }
        if (extendedPeriodListGerador) {
            return extendedPeriodListGerador;
        }
        if(extendedPeriodListMoreGerador) {
            return extendedPeriodListMoreGerador; 
        }
        return [];
    }, [referencePeriodListGerador, extendedPeriodListGerador, extendedPeriodListMoreGerador]);
    
    const { 
        data: detailedReferencePeriodListGerador,
        isLoading: isLoadingDetailsGerador,
        isError: isErrorDetailsGerador,
        error: errorDetailsGerador
    } = useQuery<MTRResponseI[], Error>(['mtrDetailsGerador', 1, allMtrsGerador], async ()=> await getMtrDetails(allMtrsGerador || [], profile?.objetoResposta.token || ""),
        {
            enabled: !!extendedPeriodListGerador && !!profile?.objetoResposta.token,
        }
    )

    const {
        data: referencePeriodListAT, 
        isSuccess: isSuccessListAT,
        isError: isErrorListAT,
        error: errorListAT
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsAT', 1, dateFrom, dateTo], 
        async ()=> await getMtrList("Armazenador Temporário", formatDateForAPI(dateFrom), formatDateForAPI(dateTo), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodListAT,
        isSuccess: isSuccessListExtentedAT,
        isError: isErrorListExtentedAT,
        error: errorListExtentedAT
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsAT', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatDateForAPI(dateFromBefore), formatDateForAPI(dateToBefore), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedMorePeriodListAT,
        isSuccess: isSuccessListExtentedMoreAT,
        isError: isErrorListExtentedMoreAT,
        error: errorListExtentedMoreAT
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsAT', 3, dateFromBeforeBefore, dateToBeforeBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatDateForAPI(dateFromBeforeBefore), formatDateForAPI(dateToBeforeBefore), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const allMtrsAT = useMemo(() => {
        if (referencePeriodListAT && extendedPeriodListAT && extendedMorePeriodListAT) {
            return [...referencePeriodListAT, ...extendedPeriodListAT, ...extendedMorePeriodListAT];
        }
        if (referencePeriodListAT) {
            return referencePeriodListAT;
        }
        if (extendedPeriodListAT) {
            return extendedPeriodListAT;
        }
        if(extendedMorePeriodListAT) {
            return extendedMorePeriodListAT;
        }
        return [];
    }, [referencePeriodListAT, extendedPeriodListAT, extendedMorePeriodListAT]);

    const { 
        data: detailedReferencePeriodListAT,
        isLoading: isLoadingDetailsAT,
        isError: isErrorDetailsAT,
        error: errorDetailsAT
    } = useQuery<MTRResponseI[], Error>(['mtrDetailsAT', 1, allMtrsAT], async ()=> await getMtrDetails(allMtrsAT || [], token || ""),
        {
            enabled: !!referencePeriodListAT && !!extendedPeriodListAT && !!extendedMorePeriodListAT
        }
    )
    


    const isLoadingGerador = !isSuccessListGerador || !isSuccessListExtentedGerador || !isSuccessListExtentedMoreGerador;
    const isErrorGerador = isErrorListGerador || isErrorListExtentedGerador || isErrorListExtentedMoreGerador;
    const errorGerador = errorListGerador || errorListExtentedGerador || errorListExtentedMoreGerador;
    
    if (isLoadingGerador) return <CustomMessage message="Carregando lista de MTRs do Gerador..."/>
    if (isErrorGerador && errorGerador) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar lista de MTRs: {errorGerador.message}</p>;
    
    if (isLoadingDetailsGerador) return <CustomMessage message="Carregando detalhes dos MTRs do Gerador..."/>
    if (isErrorDetailsGerador && errorDetailsGerador) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar detalhes dos MTRs: {errorDetailsGerador.message}</p>;



    const isLoadingAT = !isSuccessListAT || !isSuccessListExtentedAT || !isSuccessListExtentedMoreAT
    const isErrorAT = isErrorListAT || isErrorListExtentedAT || isErrorListExtentedMoreAT;
    const errorAT = errorListAT || errorListExtentedAT || errorListExtentedMoreAT;
    
    if (isLoadingAT) return <CustomMessage message="Carregando lista de MTRs do Armazenamento Temporário..."/>
    if (isErrorAT && errorAT) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar lista de MTRs do Armazenamento Temporário: {errorAT.message}</p>;
    
    if(isLoadingDetailsAT) return <CustomMessage message="Carregando detalhes dos MTRs do Armazenamento Temporário..."/>
    if (isErrorDetailsAT && errorDetailsAT) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar detalhes dos MTRs do Armazenamento Temporário: {errorDetailsAT.message}</p>;

    if(!allMtrsAT.length) {
        return(
            <div className="flex gap-2 w-full h-[calc(100vh-117px)] items-center justify-center text-black/80">
                <Info />
                <p>Não há nada para exibir para este armazenador temporário</p>
            </div>
        )
    }

    return(
        <div className="flex flex-col gap-6 p-6">

            <GraficoBarraDupla
                title="Manifestos recebidos no destinador final (saída do gerador)"
                subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                acumulated={totalizeReceived(groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListGerador || [], dateFrom, dateTo)))}
                dataChart={groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListGerador || [], dateFrom, dateTo))}
            />
            <DialogListMTR listMtrs={filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListGerador || [], dateFrom, dateTo)} />

            <GraficoBarraDupla
                title="Manifestos recebidos no destinador final (saída do armazenamento temporário)"
                subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                acumulated={totalizeReceived(groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListAT || [], dateFrom, dateTo)))}
                dataChart={groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListAT || [], dateFrom, dateTo))}
            />
            <DialogListMTR listMtrs={filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListAT || [], dateFrom, dateTo)}/>

            <div className="flex w-full justify-between">
                <p className="w-[33%] font-semibold">Tipo de Resíduo</p>
                <p className="w-[33%] text-right font-semibold">Estimado</p>
                <p className="w-[33%] text-right font-semibold">Recebido</p>
            </div>
            <div className="w-full h-[1px] bg-gray-300"/>

            {
                detailedReferencePeriodListGerador &&
                    groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListGerador || [], dateFrom, dateTo)).map(typeWaste => (
                        <div key={typeWaste.resDescricao} className="flex w-full justify-between">
                            <p className="w-[33%]">{typeWaste.resDescricao}</p>
                            <p className="w-[33%] text-right">{typeWaste.quantidadeEstimada.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="w-[33%] text-right">{typeWaste.quantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    ))
            }
            {
                detailedReferencePeriodListAT &&
                    groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListAT || [], dateFrom, dateTo)).map(typeWaste => (
                        <div key={typeWaste.resDescricao} className="flex w-full justify-between">
                            <p className="w-[33%]">{typeWaste.resDescricao}</p>
                            <p className="w-[33%] text-right">{typeWaste.quantidadeEstimada.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="w-[33%] text-right">{typeWaste.quantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    ))
            }

            <div className="w-full h-[1px] bg-gray-300"/>
            
            <div className="flex w-full justify-between">
                <p className="w-[33%] font-semibold">Total</p>
                <p className="w-[33%] text-right font-semibold">
                    {(totalizeEstimated(groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListGerador || [], dateFrom, dateTo))) +
                    totalizeEstimated(groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListAT || [], dateFrom, dateTo))))
                        .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="w-[33%] text-right font-semibold">
                    {(totalizeReceived(groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListGerador || [], dateFrom, dateTo))) +
                    totalizeReceived(groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodListAT || [], dateFrom, dateTo))))
                        .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>

        </div>
    )
}