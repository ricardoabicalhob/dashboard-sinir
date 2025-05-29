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
import generatePdfListaMtrsPorDestinadorDownload from "@/repositories/generatePdfListaMtrsPorDestinadorDownload"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filtrarTudoComDataDeEmissaoDentroDoPeriodo, filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo, filtrarTudoComDataDeRecebimentoDentroDoPeriodo, filtrarEstoqueDeArmazenamentoTemporario, agruparPorTipoDeResiduo, filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario, agruparPorDestinador } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeIndicadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { ArrowUp, ChartColumnBig, Download, Info, List } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function ArmazenadorTemporarioPage() {

    const { 
        token,
        loginResponse
    } = useContext(AuthContext)
    const [ dateFrom, setDateFrom ] = useState<Date>(new Date(formatarDataDDMMYYYYParaMMDDYYYY(subDays(new Date(Date.now()), 30).toLocaleDateString()) || ""))
    const [ dateTo, setDateTo ] = useState<Date>(new Date(formatarDataDDMMYYYYParaMMDDYYYY(new Date(Date.now()).toLocaleDateString()) || ""))
    const dateFromBefore = subDays(dateFrom, 90)
    const dateToBefore = subDays(dateFrom, 1)
    const dateFromBeforeBefore = subDays(dateFromBefore, 90)
    const dateToBeforeBefore = subDays(dateFromBefore, 1)
    const [ profile, setProfile ] = useState<LoginResponseI>()

    const [ hideChartManifestsGenerated, setHideChartManifestsGenerated ] = useState(false)
    const [ hideChartManifestsReceived, setHideChartManifestsReceived ] = useState(false)
    const [ hideChartManifestsSending, setHideChartManifestsSending ] = useState(false)
    const [ hideChartManifestsStock, setHideChartManifestsStock ] = useState(false)
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

    function handleShowChartManifestsSending() {
        setHideChartManifestsSending(false)
    }

    function handleShowListManifestsSending() {
        setHideChartManifestsSending(true)
    }
    
    function handleShowChartManifestsStock() {
        setHideChartManifestsStock(false)
    }

    function handleShowListManifestsStock() {
        setHideChartManifestsStock(true)
    }

    function handleShowChartManifestsPending() {
        setHideChartManifestsPending(false)
    }

    function handleShowListManifestsPending() {
        setHideChartManifestsPending(true)
    }

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
        async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), token || "", "Todos", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), token || "", "Todos", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedMorePeriodList,
        isSuccess: isSuccessListExtentedMore,
        isError: isErrorListExtentedMore,
        error: errorListExtentedMore
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 3, dateFromBeforeBefore, dateToBeforeBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), token || "", "Todos", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido", "Salvo"]), {
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
        <div id="topo" className="flex flex-col gap-6 p-6">

            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Meus resíduos como Armazenador Temporário</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade indicada no MTR</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#geradosParaMim">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos recebidos em meu Armazenamento Temporário</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo Armazenador Temporário</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#recebidosPorMim">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos destinados a partir do meu Armazenamento Temporário</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ (totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo destinador</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#destinadosApartirDeMim">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos armazenados em meu Armazenamento Temporário</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Resíduos gerados dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-yellow-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || []))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo Armazenador Temporário</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#armazenadosComigo">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos ainda não recebidos em meu Armazenamento Temporário</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Resíduos gerados dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-red-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || []))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade indicada no MTR</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#pendentes">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
            </Scoreboard>

            <div id="geradosParaMim"/>
            {
                !hideChartManifestsGenerated &&
                    <GraficoSimples
                        title="Meus resíduos como Armazenador Temporário"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsGenerated &&
                    <ListaDeMtrs
                        title="Meus manifestos como Armazenador Temporário"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Resíduo", "Quantidade Indicada no MTR"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsGenerated}
                    setDisableButton={()=> handleShowChartManifestsGenerated()}
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                     
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsGenerated}
                    setDisableButton={()=> handleShowListManifestsGenerated()}
                >
                    <List className="w-4 h-4 text-white"/> Manifestos
                </SwitchButton>
                {
                    hideChartManifestsGenerated &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={!hideChartManifestsGenerated}
                            setDisableButton={()=> {}}
                            onClick={()=> generatePdfListaMtrsDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MEUS MANIFESTOS COMO ARMAZENADOR TEMPORÁRIO",
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR"]
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

            <div id="recebidosPorMim"/>
            {
                !hideChartManifestsReceived &&
                    <GraficoSimples
                        title="Resíduos recebidos em meu Armazenamento Temporário"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsReceived &&
                    <ListaDeMtrs
                        title="Manifestos recebidos em meu Armazenamento Temporário"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Resíduo", "Quantidade Indicada no MTR", "Data Recebimento AT"]}
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
                                "MANIFESTOS RECEBIDOS EM MEU ARMAZENAMENTO TEMPORÁRIO",
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR", "Data Recebimento AT"]
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

            <div id="destinadosApartirDeMim"/>
            {
                !hideChartManifestsSending &&
                    <GraficoBarraDupla
                        title="Resíduos destinados a partir do meu Armazenamento Temporário"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsSending &&
                    <ListaDeMtrs
                        title="Meus manifestos como Armazenador Temporário recebidos pelo destinador final"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Destinador", "Resíduo", "Quantidade Indicada no MTR", "Quantidade Recebida", "Data Recebimento"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsSending}
                    setDisableButton={()=> handleShowChartManifestsSending()}
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                     
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsSending}
                    setDisableButton={()=> handleShowListManifestsSending()}
                >
                    <List className="w-4 h-4 text-white"/> Manifestos
                </SwitchButton>
                {
                    hideChartManifestsSending &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={!hideChartManifestsSending}
                            setDisableButton={()=> {}}
                            onClick={()=> generatePdfListaMtrsPorDestinadorDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MEUS MANIFESTOS COMO ARMAZENADOR TEMPORÁRIO RECEBIDOS PELO DESTINADOR FINAL",
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                agruparPorDestinador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)),
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

            <div id="armazenadosComigo"/>
            {
                !hideChartManifestsStock &&
                    <GraficoSimples
                        title="Resíduos armazenados em meu Armazenamento Temporário"
                        subTitle={`Resíduos gerados dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || [])))}
                        dataChart={agruparPorTipoDeResiduo(filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || []))}
                    />
            }

            {
                hideChartManifestsStock &&
                    <ListaDeMtrs
                        title="Manifestos ainda não enviados para o destinador final"
                        subtitle={`Manifestos emitidos dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || [])}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Resíduo", "Quantidade Indicada no MTR", "Data Recebimento AT"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsStock}
                    setDisableButton={()=> handleShowChartManifestsStock()}
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                     
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsStock}
                    setDisableButton={()=> handleShowListManifestsStock()}
                >
                    <List className="w-4 h-4 text-white"/> Manifestos
                </SwitchButton>
                {
                    hideChartManifestsStock &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={!hideChartManifestsStock}
                            setDisableButton={()=> {}}
                            onClick={()=> generatePdfListaMtrsDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MANIFESTOS AINDA NÃO ENVIADOS PARA O DESTINADOR FINAL",
                                `Manifestos emitidos de ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || []),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR", "Data Recebimento AT"]
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
                        title="Resíduos ainda não recebidos em meu Armazenamento Temporário"
                        subTitle={`Resíduos gerados dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || [])))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || []))}
                    />
            }
            
            {
                hideChartManifestsPending &&
                    <ListaDeMtrs 
                        title="Manifestos ainda não recebidos em meu Armazenamento Temporário"
                        subtitle={`Manifestos emitidos dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || [])}     
                        authorization={profile?.objetoResposta.token || ""} 
                        options={["Gerador", "Resíduo", "Quantidade Indicada no MTR"]}         
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
                                "MANIFESTOS AINDA NÃO RECEBIDOS EM MEU ARMAZENAMENTO TEMPORÁRIO",
                                `Manifestos emitidos de ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || []),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR"]
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