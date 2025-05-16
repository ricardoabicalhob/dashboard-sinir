'use client'

import CustomMessage from "@/components/customMessage"
import GraficoBarraDupla from "@/components/graficoBarraDupla"
import GraficoSimples from "@/components/graficoSimples"
import { Scoreboard, ScoreboardItem, ScoreboardMainText, ScoreboardSubtitle, ScoreboardTitle } from "@/components/scoreboard"
import { Switch, SwitchButton } from "@/components/switch"
import ListaDeMtrs from "@/components/ui/listaDeMtrs"
import { AuthContext } from "@/contexts/auth.context"
import { SystemContext } from "@/contexts/system.context"
import { LoginResponseI } from "@/interfaces/login.interface"
import { MTRResponseI } from "@/interfaces/mtr.interface"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filtrarTudoComDataDeEmissaoDentroDoPeriodo, filtrarTudoComDataDeRecebimentoDentroDoPeriodo, filtrarTudoSemDataDeRecebimento, agruparPorTipoDeResiduo } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeApontadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { ChartColumnBig, Info, List } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function GeradorPage() {
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

    const [ hideChartManifestsIssued, setHideChartManifestsIssued ] = useState(false)
    const [ hideChartManifestsReceived, setHideChartManifestsReceived ] = useState(false)
    const [ hideChartManifestsPending, setHideChartManifestsPending] = useState(false)

    function handleShowChartManifestsIssued() {
        setHideChartManifestsIssued(false)
    }

    function handleShowListManifestsIssued() {
        setHideChartManifestsIssued(true)
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
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 1, dateFrom, dateTo, profile?.objetoResposta.parCodigo], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile, 
        refetchOnMount: true
    })
    
    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore, profile?.objetoResposta.parCodigo], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
        refetchOnMount: true
        }
    )

    const {
        data: extendedPeriodListMore,
        isSuccess: isSuccessListExtentedMore,
        isError: isErrorListExtentedMore,
        error: errorListExtentedMore
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 3, dateFromBeforeBefore, dateToBeforeBefore, profile?.objetoResposta.parCodigo], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile,
        refetchOnMount: true
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

    if(!allMtrs.length) {
        return(
            <div className="flex gap-2 w-full h-[calc(100vh-117px)] items-center justify-center text-black/80">
                <Info />
                <p>Não há nada para exibir para este gerador</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6">

            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos gerados</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{ totalizarQuantidadeApontadaNoManifesto((agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade apontada no MTR</ScoreboardSubtitle>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos destinados</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ totalizarQuantidadeRecebida((agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida</ScoreboardSubtitle>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos pendentes</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Até: ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-red-400">{ (totalizarQuantidadeApontadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || []))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade apontada no MTR</ScoreboardSubtitle>
                </ScoreboardItem>
            </Scoreboard>

            {
                !hideChartManifestsIssued &&
                    <GraficoSimples
                        title="Resíduos gerados"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeApontadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsIssued &&
                    <ListaDeMtrs 
                        title="Manifestos emitidos"
                        listMtrs={filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Armazenador Temporário", "Destinador", "Data Recebimento AT", "Data Recebimento","Situação"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsIssued}
                    setDisableButton={()=> handleShowChartManifestsIssued()}
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                     
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsIssued}
                    setDisableButton={()=> handleShowListManifestsIssued()}
                >
                    <List className="w-4 h-4 text-white"/> Lista de manifestos
                </SwitchButton>
            </Switch>

            {
                !hideChartManifestsReceived &&
                    <GraficoBarraDupla
                        title="Resíduos destinados"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsReceived &&
                    <ListaDeMtrs 
                        title="Manifestos enviados"
                        listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Destinador", "Data Recebimento","Situação"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsReceived}
                    setDisableButton={()=> handleShowChartManifestsReceived()}
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                     
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsReceived}
                    setDisableButton={()=> handleShowListManifestsReceived()}
                >
                    <List className="w-4 h-4 text-white"/> Lista de manifestos
                </SwitchButton>
            </Switch>

            {
                !hideChartManifestsPending &&
                    <GraficoSimples 
                        title="Resíduos pendentes"
                        subTitle={`Até: ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeApontadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || []))}
                    />
            }

            {
                hideChartManifestsPending &&
                    <ListaDeMtrs
                        title="Manifestos pendentes"
                        listMtrs={filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Armazenador Temporário", "Destinador", "Data Recebimento AT", "Data Recebimento","Situação"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsPending}
                    setDisableButton={()=> handleShowChartManifestsPending()}
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                     
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsPending}
                    setDisableButton={()=> handleShowListManifestsPending()}
                >
                    <List className="w-4 h-4 text-white"/> Lista de manifestos
                </SwitchButton>
            </Switch>

        </div>
    )
}