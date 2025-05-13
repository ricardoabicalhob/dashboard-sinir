'use client'

import CustomMessage from "@/components/customMessage"
import GraficoBarraDupla from "@/components/graficoBarraDupla"
import GraficoSimples from "@/components/graficoSimples"
import { Scoreboard, ScoreboardItem, ScoreboardMainText, ScoreboardSubtitle, ScoreboardTitle } from "@/components/scoreboard"
import SwitchBetweenChartAndListAndTable from "@/components/switchBetweenChartAndListAndTable"
import TabelaDemonstrativaSimples from "@/components/tabelaDemonstrativaSimples"
import ListaDeMtrs from "@/components/ui/listaDeMtrs"
import SwitchBetweenChartAndList from "@/components/ui/switchBetweenChartAndList"
import { AuthContext } from "@/contexts/auth.context"
import { SystemContext } from "@/contexts/system.context"
import { LoginResponseI } from "@/interfaces/login.interface"
import { MTRResponseI } from "@/interfaces/mtr.interface"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filtrarTudoComDataDeRecebimentoDentroDoPeriodo, filtrarTudoSemDataDeRecebimento, agruparPorTipoDeResiduo, agruparPorDestinador } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeApontadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function MovimentacaoParaDFPage() {
    const { 
        loginResponse
    } = useContext(AuthContext)
    const [ dateFrom, setDateFrom ] = useState<Date>(new Date(formatarDataDDMMYYYYParaMMDDYYYY(subDays(new Date(Date.now()), 30).toLocaleDateString()) || ""))
    const [ dateTo, setDateTo ] = useState<Date>(new Date(formatarDataDDMMYYYYParaMMDDYYYY(new Date(Date.now()).toLocaleDateString()) || ""))
    const dateFromBefore = subDays(dateFrom, 90)
    const dateToBefore = subDays(dateFrom, 1)
    const dateFromBeforeBefore = subDays(dateFromBefore, 90)
    const dateToBeforeBefore = subDays(dateFromBefore, 1)
    const [ profile, setProfile ] = useState<LoginResponseI>()

    const [ hideChartManifestsPending, setHideChartManifestsPending ] = useState(false)
    const [ showChartManifestsReceived, setShowChartManifestsReceived ] = useState(false)
    const [ showListManifestsReceived, setShowListManifestsReceived ] = useState(true)
    const [ showTableManifestsReceived, setShowTableManifestsReceived ] = useState(true)
    
    function handleShowTableManifestsReceived() {
        setShowTableManifestsReceived(false)
        setShowListManifestsReceived(true)
        setShowChartManifestsReceived(true)
    }

    function handleShowListManifestsReceived() {
        setShowListManifestsReceived(false)
        setShowChartManifestsReceived(true)
        setShowTableManifestsReceived(true)
    }

    function handleShowChartManifestsReceived() {
        setShowChartManifestsReceived(false)
        setShowListManifestsReceived(true)
        setShowTableManifestsReceived(true)
    }

    function handleShowChartManifestsPending() {
        setHideChartManifestsPending(false)
    }

    function handleShowListManifestsPending() {
        setHideChartManifestsPending(true)
    }

    const {
        dateRange
    } = useContext(SystemContext)

    useEffect(()=> {
        if(dateRange) {
            setDateFrom(new Date(formatarDataDDMMYYYYParaMMDDYYYY(dateRange.from?.toLocaleDateString() || "") || ""))
            setDateTo(new Date(formatarDataDDMMYYYYParaMMDDYYYY(dateRange.to?.toLocaleDateString() || "") || ""))
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
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile, 
    })
    
    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
        }
    )

    const {
        data: extendedPeriodListMore,
        isSuccess: isSuccessListExtentedMore,
        isError: isErrorListExtentedMore,
        error: errorListExtentedMore
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 3, dateFromBeforeBefore, dateToBeforeBefore], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
        }
    )
    
    const allMtrs = useMemo(() => {
        if (referencePeriodList && extendedPeriodList && extendedPeriodListMore) {
            return [...referencePeriodList, ...extendedPeriodList, ...extendedPeriodListMore];
        }
        if (referencePeriodList) {
            return referencePeriodList;
        }
        if (extendedPeriodList) {
            return extendedPeriodList;
        }
        if(extendedPeriodListMore) {
            return extendedPeriodListMore; 
        }
        return [];
    }, [referencePeriodList, extendedPeriodList, extendedPeriodListMore]);
    
    const { 
        data: detailedReferencePeriodList,
        isLoading: isLoadingDetails,
        isError: isErrorDetails,
        error: errorDetails
    } = useQuery<MTRResponseI[], Error>(['mtrDetails', 1, allMtrs], async ()=> await getMtrDetails(allMtrs || [], profile?.objetoResposta.token || ""),
        {
            enabled: !!extendedPeriodList && !!profile?.objetoResposta.token,
        }
    )
    
    const isLoading = !isSuccessList || !isSuccessListExtented || !isSuccessListExtentedMore;
    const isError = isErrorList || isErrorListExtented || isErrorListExtentedMore;
    const error = errorList || errorListExtented || errorListExtentedMore;
    
    if (isLoading) return <CustomMessage message="Carregando lista de MTRs..."/>
    if (isError && error) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar lista de MTRs: {error.message}</p>;
    
    if (isLoadingDetails) return <CustomMessage message="Carregando detalhes dos MTRs..."/>
    if (isErrorDetails && errorDetails) return <p className="flex w-full justify-center text-center bg-red-400">Erro ao carregar detalhes dos MTRs: {errorDetails.message}</p>;

    return (
        <div className="flex flex-col gap-6 p-6">

            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos recebidos no destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ (totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida</ScoreboardSubtitle>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos pendentes de recebimento</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Até: ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ (totalizarQuantidadeApontadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade apontada no MTR</ScoreboardSubtitle>
                </ScoreboardItem>
            </Scoreboard>

            {
                !showChartManifestsReceived &&
                    <GraficoBarraDupla
                        title="Resíduos recebidos no destinador final"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                !showListManifestsReceived &&
                    <ListaDeMtrs 
                        title="Manifestos recebidos no destinador final"
                        listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Destinador", "Data Recebimento", "Situação"]}
                    />
            }

            {
                !showTableManifestsReceived &&
                    <TabelaDemonstrativaSimples 
                        tipo="Destinador"
                        title="Resíduos recebidos no destinador final"
                        listaAgrupadaPorDestinadorOuGerador={agruparPorDestinador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }


            <SwitchBetweenChartAndListAndTable
                handleShowChartManifests={()=> handleShowChartManifestsReceived()}
                handleShowListManifests={()=> handleShowListManifestsReceived()}
                handleShowTableManifests={()=> handleShowTableManifestsReceived()}
                disableChartButton={!showChartManifestsReceived}
                disableListButton={!showListManifestsReceived}
                disableTableButton={!showTableManifestsReceived}
            />

            {
                !hideChartManifestsPending &&
                    <GraficoSimples
                        title="Resíduos pendentes de recebimento no destinador final"
                        subTitle={`Até: ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeApontadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || []))}
                    />
            }

            {
                hideChartManifestsPending &&
                    <ListaDeMtrs 
                        title="Manifestos pendentes de recebimento no destinador final"
                        listMtrs={filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Destinador", "Data Recebimento", "Situação"]}
                    />
            }

            <SwitchBetweenChartAndList
                handleShowChartManifests={()=> handleShowChartManifestsPending()}
                handleShowListManifests={()=> handleShowListManifestsPending()}
                disableChartButton={!hideChartManifestsPending}
                disableListButton={hideChartManifestsPending}
            />

        </div>
    )
}