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
import generatePdfListaMtrsDownload from "@/repositories/generatePdfListaMtrsDownload"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filtrarTodosQuePossuemArmazenamentoTemporario, filtrarTudoComDataDeEmissaoDentroDoPeriodo, agruparPorTipoDeResiduo, filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo, filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeIndicadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { ArrowUp, ChartColumnBig, Download, List } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function MovimentacaoParaATPage() {
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
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 1, dateFrom, dateTo], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile, 
    })
    
    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]), {
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
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]), {
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
        <div id="topo" className="flex flex-col gap-6 p-6">

            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos gerados para o Armazenamento Temporário</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo)))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade indicada no MTR</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#geradosParaAT">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos movimentados para o Armazenamento Temporário</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ (totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo)))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#enviadosParaAT">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos pendentes</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Todos até: ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-red-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []))))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade indicada no MTR</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#pendentes">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
            </Scoreboard>

            <div id="geradosParaAT"/>
            {
                !hideChartManifestsIssued &&
                    <GraficoSimples
                        title="Resíduos gerados para o armazenamento temporário"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsIssued &&
                    <ListaDeMtrs 
                        title="Manifestos emitidos para o armazenamento temporário"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeEmissaoDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Armazenador Temporário", "Resíduo", "Quantidade Indicada no MTR"]}
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
                    <List className="w-4 h-4 text-white"/> Manifestos
                </SwitchButton>
                {
                    hideChartManifestsIssued &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={!hideChartManifestsIssued}
                            setDisableButton={()=> {}}
                            onClick={()=> generatePdfListaMtrsDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MANIFESTOS GERADOS PARA O ARMAZENAMENTO TEMPORÁRIO",
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoComDataDeEmissaoDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo),
                                ["Número MTR", "Data Emissão", "Armazenador Temporário", "Resíduo", "Quantidade Indicada no MTR"],
                            )}
                        >
                            <Download /> Baixar PDF
                        </SwitchButton>
                }
                <a href="#topo">
                    <SwitchButton
                        className="bg-gray-400 hover:bg-gray-400/50"
                        disableButton={false}
                        setDisableButton={()=> {}}

                    >
                        <ArrowUp />
                        Ir para o topo
                    </SwitchButton>
                </a>
            </Switch>

            <div id="enviadosParaAT"/>
            {
                !hideChartManifestsReceived &&
                    <GraficoBarraDupla
                        title="Resíduos recebidos pelo armazenador temporário"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsReceived &&
                    <ListaDeMtrs 
                        title="Manifestos recebidos pelo armazenador temporário"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Armazenador Temporário", "Resíduo", "Quantidade Indicada no MTR", "Data Recebimento AT"]}
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
                    <List className="w-4 h-4 text-white"/> Manifestos
                </SwitchButton>
                {
                    hideChartManifestsReceived &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={!hideChartManifestsReceived}
                            setDisableButton={()=> {}}
                            onClick={()=> generatePdfListaMtrsDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MANIFESTOS RECEBIDOS NO ARMAZENADOR TEMPORÁRIO",
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []), dateFrom, dateTo),
                                ["Número MTR", "Data Emissão", "Armazenador Temporário", "Resíduo", "Quantidade Indicada no MTR", "Data Recebimento AT"],
                            )}
                        >
                            <Download /> Baixar PDF
                        </SwitchButton>
                }
                <a href="#topo">
                    <SwitchButton
                        className="bg-gray-400 hover:bg-gray-400/50"
                        disableButton={false}
                        setDisableButton={()=> {}}

                    >
                        <ArrowUp />
                        Ir para o topo
                    </SwitchButton>
                </a>
            </Switch>

            <div id="pendentes"/>
            {
                !hideChartManifestsPending &&
                    <GraficoSimples 
                        title="Resíduos pendentes de recebimento no armazenamento temporário"
                        subTitle={`Todos até: ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []))))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || [])))}
                    />
            }

            {
                hideChartManifestsPending &&
                    <ListaDeMtrs
                        title="Manifestos pendentes de recebimento no armazenamento temporário"
                        subtitle={`Todos até: ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || []))}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Armazenador Temporário", "Resíduo", "Quantidade Indicada no MTR"]}
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
                    <List className="w-4 h-4 text-white"/> Manifestos
                </SwitchButton>
                {
                    hideChartManifestsPending &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={!hideChartManifestsPending}
                            setDisableButton={()=> {}}
                            onClick={()=> generatePdfListaMtrsDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MANIFESTOS NÃO RECEBIDOS NO ARMAZENADOR TEMPORÁRIO",
                                `Todos até: ${dateTo.toLocaleDateString()}`,
                                filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(filtrarTodosQuePossuemArmazenamentoTemporario(detailedReferencePeriodList || [])),
                                ["Número MTR", "Data Emissão", "Armazenador Temporário", "Resíduo", "Quantidade Indicada no MTR"],
                            )}
                        >
                            <Download /> Baixar PDF
                        </SwitchButton>
                }
                <a href="#topo">
                    <SwitchButton
                        className="bg-gray-400 hover:bg-gray-400/50"
                        disableButton={false}
                        setDisableButton={()=> {}}

                    >
                        <ArrowUp />
                        Ir para o topo
                    </SwitchButton>
                </a>
            </Switch>

        </div>
    )
}