'use client'

import CustomMessage from "@/components/customMessage"
import GraficoBarraDupla from "@/components/graficoBarraDupla"
import GraficoSimples from "@/components/graficoSimples"
import ListaDeMtrs from "@/components/ui/listaDeMtrs"
import SwitchBetweenChartAndList from "@/components/ui/switchBetweenChartAndList"
import { AuthContext } from "@/contexts/auth.context"
import { SystemContext } from "@/contexts/system.context"
import { LoginResponseI } from "@/interfaces/login.interface"
import { MTRResponseI } from "@/interfaces/mtr.interface"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filterAllWithIssueDateWithinThePeriod, filterEverythingWithDateReceivedWithinThePeriod, filterEverythingWithoutAReceiptDateWithinThePeriod, groupByWasteType } from "@/utils/fnFilters"
import { formatDateDDMMYYYYForMMDDYYYY, formatDateForAPI, totalizeEstimated, totalizeReceived } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function DestinadorPage() {

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

    const [ hideChartManifestsGenerated, setHideChartManifestsGenerated ] = useState(false)
    const [ hideChartManifestsReceived, setHideChartManifestsReceived ] = useState(false)
    const [ hideChartManifestsPending, setHideChartManifestsPending ] = useState(false)

    const {
        dateRange
    } = useContext(SystemContext)

    function handleShowChartManifestsGenerated() {
        setHideChartManifestsGenerated(false)
    }

    function handleShowListManifestsGenerated() {
        setHideChartManifestsGenerated(true)
    }

    function handleShowChartManifestsReceived() {
        setHideChartManifestsReceived(false)
    }

    function handleShowListManifestsReceived() {
        setHideChartManifestsReceived(true)
    }

    function handleShowChartManifestsPending() {
        setHideChartManifestsPending(false)
    }

    function handleShowListManifestsPending() {
        setHideChartManifestsPending(true)
    }

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
        async ()=> await getMtrList("Destinador", formatDateForAPI(dateFrom), formatDateForAPI(dateTo), token || "", profile?.objetoResposta.parCodigo, ["Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Destinador", formatDateForAPI(dateFromBefore), formatDateForAPI(dateToBefore), token || "", profile?.objetoResposta.parCodigo, ["Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodListMore,
        isSuccess: isSuccessListExtentedMore,
        isError: isErrorListExtentedMore,
        error: errorListExtentedMore
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 3, dateFromBeforeBefore, dateFromBeforeBefore], 
        async ()=> await getMtrList("Destinador", formatDateForAPI(dateFromBeforeBefore), formatDateForAPI(dateToBeforeBefore), token || "", profile?.objetoResposta.parCodigo, ["Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const allMtrs = useMemo(() => {
        if (referencePeriodList && extendedPeriodList && extendedPeriodListMore) {
            return [...referencePeriodList, ...extendedPeriodList];
        }
        if (referencePeriodList) {
            return referencePeriodList;
        }
        if (extendedPeriodList) {
            return extendedPeriodList;
        }
        if (extendedPeriodListMore) {
            return extendedPeriodListMore;
        }
        return [];
    }, [referencePeriodList, extendedPeriodList, extendedPeriodListMore]);

    const { 
        data: detailedReferencePeriodList,
        isLoading: isLoadingDetails,
        isError: isErrorDetails,
        error: errorDetails
    } = useQuery<MTRResponseI[], Error>(['mtrDetails', 1, allMtrs], async ()=> await getMtrDetails(allMtrs || [], token || ""),
        {
        enabled: !!extendedPeriodList
        }
    )
    
    const isLoading = !isSuccessList || !isSuccessListExtented || !isSuccessListExtentedMore
    const isError = isErrorList || isErrorListExtented || isErrorListExtentedMore;
    const error = errorList || errorListExtented || errorListExtentedMore;
    
    if (isLoading) return <CustomMessage message="Carregando lista de MTRs..."/>
    if (isError && error) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar lista de MTRs: {error.message}</p>;
    
    if(isLoadingDetails) return <CustomMessage message="Carregando detalhes dos MTRs..."/>
    if (isErrorDetails && errorDetails) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar detalhes dos MTRs: {errorDetails.message}</p>;

    return(
        <div className="flex flex-col gap-6 p-6">

            {
                !hideChartManifestsGenerated &&
                    <GraficoSimples
                        title="Manifestos gerados para recebimento como destinador"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizeEstimated(groupByWasteType(filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={groupByWasteType(filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsGenerated &&
                    <ListaDeMtrs
                        title="Manifestos gerados para recebimento como destinador"
                        listMtrs={filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                    />
            }

            <SwitchBetweenChartAndList
                handleShowChartManifests={()=> handleShowChartManifestsGenerated()}
                handleShowListManifests={()=> handleShowListManifestsGenerated()}
            />
    
            {
                !hideChartManifestsReceived &&
                    <GraficoBarraDupla
                        title="Manifestos recebidos"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizeReceived(groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsReceived &&
                    <ListaDeMtrs
                        title="Manifestos recebidos"
                        listMtrs={filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                    />
            }

            <SwitchBetweenChartAndList
                handleShowChartManifests={()=> handleShowChartManifestsReceived()}
                handleShowListManifests={()=> handleShowListManifestsReceived()}
            />

            {
                !hideChartManifestsPending &&
                    <GraficoSimples 
                        title="Manifestos pendentes de recebimento (últimos 210 dias)"
                        subTitle={`Período: ${subDays(new Date(Date.now()), 210).toLocaleDateString()} à ${new Date(Date.now()).toLocaleDateString()}`}
                        acumulated={totalizeEstimated(groupByWasteType(filterEverythingWithoutAReceiptDateWithinThePeriod(detailedReferencePeriodList || [])))}
                        dataChart={groupByWasteType(filterEverythingWithoutAReceiptDateWithinThePeriod(detailedReferencePeriodList || []))}
                    />
            }

            {
                hideChartManifestsPending &&
                    <ListaDeMtrs
                        title="Manifestos pendentes de recebimento (últimos 210 dias)"
                        listMtrs={filterEverythingWithoutAReceiptDateWithinThePeriod(detailedReferencePeriodList || [])}
                        authorization={profile?.objetoResposta.token || ""}
                    />
            }

            <SwitchBetweenChartAndList
                handleShowChartManifests={()=> handleShowChartManifestsPending()}
                handleShowListManifests={()=> handleShowListManifestsPending()}
            />

        </div>
    )
}