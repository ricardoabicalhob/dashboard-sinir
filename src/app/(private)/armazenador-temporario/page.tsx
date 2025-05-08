'use client'

import CustomMessage from "@/components/customMessage"
import DialogListMTR from "@/components/dialogListMTR"
import GraficoBarraDupla from "@/components/graficoBarraDupla"
import GraficoSimples from "@/components/graficoSimples"
import { AuthContext } from "@/contexts/auth.context"
import { SystemContext } from "@/contexts/system.context"
import { LoginResponseI } from "@/interfaces/login.interface"
import { MTRResponseI } from "@/interfaces/mtr.interface"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filterAllWithIssueDateWithinThePeriod, filterEverythingWithDateReceivedInTemporaryStorageWithinThePeriod, filterEverythingWithDateReceivedWithinThePeriod, filterStockFromTemporaryStorage, groupByWasteType } from "@/utils/fnFilters"
import { formatDateDDMMYYYYForMMDDYYYY, formatDateForAPI, totalizeEstimated, totalizeReceived } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { ChartColumnBig, Info } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function ArmazenadorTemporarioPage() {

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
        data: referencePeriodList, 
        isSuccess: isSuccessList,
        isError: isErrorList,
        error: errorList
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 1, dateFrom, dateTo], 
        async ()=> await getMtrList("Armazenador Temporário", formatDateForAPI(dateFrom), formatDateForAPI(dateTo), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatDateForAPI(dateFromBefore), formatDateForAPI(dateToBefore), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedMorePeriodList,
        isSuccess: isSuccessListExtentedMore,
        isError: isErrorListExtentedMore,
        error: errorListExtentedMore
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 3, dateFromBeforeBefore, dateToBeforeBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatDateForAPI(dateFromBeforeBefore), formatDateForAPI(dateToBeforeBefore), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const allMtrs = useMemo(() => {
        if (referencePeriodList && extendedPeriodList && extendedMorePeriodList) {
            return [...referencePeriodList, ...extendedPeriodList, ...extendedMorePeriodList];
        }
        if (referencePeriodList) {
            return referencePeriodList;
        }
        if (extendedPeriodList) {
            return extendedPeriodList;
        }
        if(extendedMorePeriodList) {
            return extendedMorePeriodList;
        }
        return [];
    }, [referencePeriodList, extendedPeriodList, extendedMorePeriodList]);

    const { 
        data: detailedReferencePeriodList,
        isLoading: isLoadingDetails,
        isError: isErrorDetails,
        error: errorDetails
    } = useQuery<MTRResponseI[], Error>(['mtrDetails', 1, allMtrs], async ()=> await getMtrDetails(allMtrs || [], token || ""),
        {
            enabled: !!referencePeriodList && !!extendedPeriodList && !!extendedMorePeriodList
        }
    )
    
    const isLoading = !isSuccessList || !isSuccessListExtented || !isSuccessListExtentedMore
    const isError = isErrorList || isErrorListExtented || isErrorListExtentedMore;
    const error = errorList || errorListExtented || errorListExtentedMore;
    
    if (isLoading) return <CustomMessage message="Carregando lista de MTRs..."/>
    if (isError && error) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar lista de MTRs: {error.message}</p>;
    
    if(isLoadingDetails) return <CustomMessage message="Carregando detalhes dos MTRs..."/>
    if (isErrorDetails && errorDetails) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar detalhes dos MTRs: {errorDetails.message}</p>;

    if(!allMtrs.length) {
        return(
            <div className="flex gap-2 w-full h-[calc(100vh-117px)] items-center justify-center text-black/80">
                <Info />
                <p>Não há nada para exibir para este armazenador temporário</p>
            </div>
        )
    }

    return(
        <div className="flex flex-col gap-6 p-6">

            <GraficoSimples
                title="Manifestos gerados para armazenamento temporário"
                subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                acumulated={totalizeEstimated(groupByWasteType(filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                dataChart={groupByWasteType(filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo))}
            />
            <DialogListMTR listMtrs={filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)}/>
            <div className="flex w-fit h-fit p-2 bg-[#00BCD4] shadow-md shadow-gray-500 rounded-full cursor-pointer">
                <ChartColumnBig className="w-4 h-4 text-white"/>
            </div>

            <GraficoSimples
                title="Manifestos recebidos no armazenamento temporário (entrada no armazenamento temporário)"
                subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                acumulated={totalizeEstimated(groupByWasteType(filterEverythingWithDateReceivedInTemporaryStorageWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                dataChart={groupByWasteType(filterEverythingWithDateReceivedInTemporaryStorageWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo))}
            />
            <DialogListMTR listMtrs={filterEverythingWithDateReceivedInTemporaryStorageWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)}/>

            <GraficoBarraDupla
                title="Manifestos recebidos no destinador final (saída do armazenamento temporário)"
                subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                acumulated={totalizeReceived(groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                dataChart={groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo))}
            />
            <DialogListMTR listMtrs={filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)}/>

            <GraficoSimples
                title="Manifestos em armazenamento temporário (estoque)"
                subTitle={`Em: ${new Date(Date.now()).toLocaleDateString()}`}
                acumulated={totalizeEstimated(groupByWasteType(filterStockFromTemporaryStorage(detailedReferencePeriodList || [])))}
                dataChart={groupByWasteType(filterStockFromTemporaryStorage(detailedReferencePeriodList || []))}
            />
            <DialogListMTR listMtrs={filterStockFromTemporaryStorage(detailedReferencePeriodList || [])}/>

        </div>
    )
}