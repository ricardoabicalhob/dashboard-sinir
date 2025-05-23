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
import { filtrarTudoComDataDeEmissaoDentroDoPeriodo, filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo, filtrarTudoComDataDeRecebimentoDentroDoPeriodo, filtrarEstoqueDeArmazenamentoTemporario, agruparPorTipoDeResiduo, filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeIndicadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { ChartColumnBig, Download, Info, List } from "lucide-react"
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
        async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido", "Salvo"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedMorePeriodList,
        isSuccess: isSuccessListExtentedMore,
        isError: isErrorListExtentedMore,
        error: errorListExtentedMore
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 3, dateFromBeforeBefore, dateToBeforeBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido", "Salvo"]), {
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

            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos gerados para o AT</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade indicada no MTR</ScoreboardSubtitle>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos recebidos no AT</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo Armazenador Temporário</ScoreboardSubtitle>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos destinados a partir do AT</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ (totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo destinador</ScoreboardSubtitle>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos armazenados no AT</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Todos até: ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-yellow-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || []))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida pelo Armazenador Temporário</ScoreboardSubtitle>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Resíduos pendentes de recebimento no AT</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Todos até: ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-red-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || []))) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade indicada no MTR</ScoreboardSubtitle>
                </ScoreboardItem>
            </Scoreboard>

            {
                !hideChartManifestsGenerated &&
                    <GraficoSimples
                        title="Resíduos gerados para armazenamento temporário"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsGenerated &&
                    <ListaDeMtrs
                        title="Manifestos emitidos para armazenamento temporário"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador"]}
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
                                "MANIFESTOS EMITIDOS PARA O ARMAZENAMENTO TEMPORÁRIO",
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoComDataDeEmissaoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR"]
                            )}
                        >
                            <Download /> Baixar PDF
                        </SwitchButton>
                }
            </Switch>

            {
                !hideChartManifestsReceived &&
                    <GraficoSimples
                        title="Resíduos recebidos no armazenamento temporário"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsReceived &&
                    <ListaDeMtrs
                        title="Manifestos recebidos no armazenamento temporário"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Data Recebimento AT"]}
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
                                "MANIFESTOS RECEBIDOS NO ARMAZENAMENTO TEMPORÁRIO",
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoComDataDeRecebimentoEmArmazenamentoTemporarioDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR", "Data Recebimento AT"]
                            )}
                        >
                            <Download /> Baixar PDF
                        </SwitchButton>
                }
            </Switch>

            {
                !hideChartManifestsSending &&
                    <GraficoBarraDupla
                        title="Saída de resíduos do armazenamento temporário"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                hideChartManifestsSending &&
                    <ListaDeMtrs
                        title="Manifestos recebidos pelo destinador"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Destinador", "Situação", "Data Recebimento"]}
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
                            onClick={()=> generatePdfListaMtrsDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MANIFESTOS ENVIADOS PARA O DESTINADOR",
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo),
                                ["Número MTR", "Data Emissão", "Gerador", "Destinador", "Resíduo", "Quantidade Recebida", "Data Recebimento"]
                            )}
                        >
                            <Download /> Baixar PDF
                        </SwitchButton>
                }
                
            </Switch>

            {
                !hideChartManifestsStock &&
                    <GraficoSimples
                        title="Resíduos em armazenamento temporário aguardando destinação"
                        subTitle={`Até: ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || [])))}
                        dataChart={agruparPorTipoDeResiduo(filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || []))}
                    />
            }

            {
                hideChartManifestsStock &&
                    <ListaDeMtrs
                        title="Manifestos em armazenamento temporário aguardando envio"
                        subtitle={`Tudo até: ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || [])}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Gerador", "Situação", "Data Recebimento AT"]}
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
                                "MANIFESTOS EM ARMAZENAMENTO TEMPORÁRIO AGUARDANDO ENVIO",
                                `Tudo até: ${dateTo.toLocaleDateString()}`,
                                filtrarEstoqueDeArmazenamentoTemporario(detailedReferencePeriodList || []),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR", "Data Recebimento AT"]
                            )}
                        >
                            <Download /> Baixar PDF
                        </SwitchButton>
                }
            </Switch>

            {
                !hideChartManifestsPending &&
                    <GraficoSimples 
                        title="Resíduos pendentes de recebimento pelo AT"
                        subTitle={`Tudo até: ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || [])))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || []))}
                    />
            }
            
            {
                hideChartManifestsPending &&
                    <ListaDeMtrs 
                        title="Manifestos pendentes de recebimento pelo AT"
                        subtitle={`Tudo até: ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || [])}     
                        authorization={profile?.objetoResposta.token || ""} 
                        options={["Gerador", "Situação"]}         
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
                                "MANIFESTOS PENDENTES DE RECEBIMENTO NO ARMAZENAMENTO TEMPORÁRIO",
                                `Tudo até: ${dateTo.toLocaleDateString()}`,
                                filtrarTudoSemDataDeRecebimentoEmArmazenamentoTemporario(detailedReferencePeriodList || []),
                                ["Número MTR", "Data Emissão", "Gerador", "Resíduo", "Quantidade Indicada no MTR"]
                            )}
                        >
                            <Download /> Baixar PDF
                        </SwitchButton>
                }
            </Switch>

        </div>
    )
}