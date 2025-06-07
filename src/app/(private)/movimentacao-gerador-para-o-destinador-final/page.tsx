'use client'

import CustomMessage from "@/components/customMessage"
import GraficoBarraDupla from "@/components/graficoBarraDupla"
import GraficoSimples from "@/components/graficoSimples"
import { Scoreboard, ScoreboardItem, ScoreboardMainText, ScoreboardSubtitle, ScoreboardTitle } from "@/components/scoreboard"
import { Switch, SwitchButton } from "@/components/switch"
import TabelaDemonstrativaSimples from "@/components/tabelaDemonstrativaSimples"
import ListaDeMtrs from "@/components/ui/listaDeMtrs"
import { AuthContext } from "@/contexts/auth.context"
import { SystemContext } from "@/contexts/system.context"
import { LoginResponseI } from "@/interfaces/login.interface"
import { MTRResponseI } from "@/interfaces/mtr.interface"
import generatePdfListaMtrsDownload from "@/repositories/generatePdfListaMtrsDownload"
import generatePdfListaMtrsPorDestinadorDownload from "@/repositories/generatePdfListaMtrsPorDestinadorDownload"
import { generatePdfTableDestinacao, prepareDataForPdf } from "@/repositories/generatePdfTableDestinacao"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filtrarTudoComDataDeRecebimentoDentroDoPeriodo, filtrarTudoSemDataDeRecebimento, agruparPorTipoDeResiduo, agruparPorDestinador } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeIndicadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { Info } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function MovimentacaoParaDFPage() {
    const { 
        loginResponse
    } = useContext(AuthContext)

    const {
        dateRange
    } = useContext(SystemContext)
    
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
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile, 
    })
    
    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]), {
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
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), profile?.objetoResposta.token || "", "Todos", profile?.objetoResposta.parCodigo, ["Salvo", "Recebido", "Armaz Temporário", "Armaz Temporário - Recebido"]), {
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

    if(!allMtrs.length) {
        return(
            <div className="flex gap-2 w-full h-[calc(100vh-117px)] items-center justify-center text-black/80">
                <Info />
                <p>Nenhuma movimentação feita para o destinador final dentro do período especificado</p>
            </div>
        )
    }

    return (
        <div id="topo" className="flex flex-col gap-6 p-6">
            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Meus resíduos movimentados para o destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText>{ (totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#enviadosParaDestinador">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Meus resíduos ainda não movimentados para o destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{ `Resíduos gerados dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-red-400">{ (totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade indicada no MTR</ScoreboardSubtitle>
                    <a className="flex gap-2 hover:text-[#00BCD4]" href="#pendentes">
                        Ver detalhes
                    </a>
                </ScoreboardItem>
            </Scoreboard>

            <div id="enviadosParaDestinador"/>
            {
                !showChartManifestsReceived &&
                    <GraficoBarraDupla
                        title="Meus resíduos movimentados para o destinador final"
                        subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            {
                !showListManifestsReceived &&
                    <ListaDeMtrs 
                        title="Meus manifestos recebidos pelo destinador final"
                        subtitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Destinador", "Resíduo", "Quantidade Indicada no MTR", "Quantidade Recebida", "Data Recebimento"]}
                    />
            }

            {
                !showTableManifestsReceived &&
                    <TabelaDemonstrativaSimples 
                        tipo="Destinador"
                        title="Detalhes da destinação"
                        periodo={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                        listaAgrupadaPorDestinadorOuGerador={agruparPorDestinador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!showChartManifestsReceived}
                    setDisableButton={()=> handleShowChartManifestsReceived()}
                >
                    {/* <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                      */}
                    Gráfico <span className="material-icons">leaderboard</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={!showListManifestsReceived}
                    setDisableButton={()=> handleShowListManifestsReceived()}
                >
                    {/* <List className="w-4 h-4 text-white"/> Manifestos */}
                    Manifestos <span className="material-icons">list_alt</span>
                </SwitchButton>
                {
                    !showListManifestsReceived &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            onClick={()=> generatePdfListaMtrsPorDestinadorDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MEUS MANIFESTOS RECEBIDOS PELO DESTINADOR FINAL", 
                                `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`, 
                                agruparPorDestinador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo))
                            )}
                            disableButton={showListManifestsReceived}
                            setDisableButton={()=> handleShowListManifestsReceived()}
                        >
                            {/* <Download /> Baixar PDF */}
                            Download <span className="material-icons">picture_as_pdf</span>
                        </SwitchButton>
                }
                <SwitchButton
                    disableButton={!showTableManifestsReceived}
                    setDisableButton={()=> handleShowTableManifestsReceived()}
                >
                    {/* <Sheet className="w-4 h-4 text-white"/> Detalhes da destinação */}
                    Detalhes da destinação <span className="material-icons">feed</span>
                </SwitchButton>
                {
                    !showTableManifestsReceived &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            disableButton={showTableManifestsReceived}
                            setDisableButton={()=> {}}
                            onClick={()=> {
                                const preparedData = prepareDataForPdf(agruparPorDestinador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodList || [], dateFrom, dateTo)), "Destinador")
                                generatePdfTableDestinacao(
                                    preparedData, 
                                    `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                    "Detalhes de destinacao dos residuos enviados para o destinador final",
                                    `${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`,
                                    "DESTINADOR"
                                )
                            }}
                        >
                            {/* <Download /> Baixar PDF */}
                            Download <span className="material-icons">picture_as_pdf</span>
                        </SwitchButton>
                }

            </Switch>

            <div id="pendentes"/>
            {
                !hideChartManifestsPending &&
                    <GraficoSimples
                        title="Meus resíduos ainda não movimentados para o destinador final"
                        subTitle={ `Resíduos gerados dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }
                        acumulated={totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])))}
                        dataChart={agruparPorTipoDeResiduo(filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || []))}
                    />
            }

            {
                hideChartManifestsPending &&
                    <ListaDeMtrs 
                        title="Meus manifestos ainda não recebidos pelo destinador final"
                        subtitle={ `Manifestos emitidos dentro do período: ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}` }
                        listMtrs={filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || [])}
                        authorization={profile?.objetoResposta.token || ""}
                        options={["Armazenador Temporário", "Destinador", "Data Recebimento", "Data Recebimento AT", "Situação"]}
                    />
            }

            <Switch>
                <SwitchButton
                    disableButton={!hideChartManifestsPending}
                    setDisableButton={()=> handleShowChartManifestsPending()}
                >
                    {/* <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                      */}
                    Gráfico <span className="material-icons">leaderboard</span>
                </SwitchButton>
                <SwitchButton
                    disableButton={hideChartManifestsPending}
                    setDisableButton={()=> handleShowListManifestsPending()}
                >
                    {/* <List className="w-4 h-4 text-white"/> Manifestos */}
                    Manifestos <span className="material-icons">list_alt</span>
                </SwitchButton>
                {
                    hideChartManifestsPending &&
                        <SwitchButton
                            className="bg-yellow-400 hover:bg-yellow-400/50"
                            onClick={()=> generatePdfListaMtrsDownload(
                                `${profile?.objetoResposta.parCodigo} - ${profile?.objetoResposta.parDescricao}`,
                                "MEUS MANIFESTOS AINDA NÃO RECEBIDOS PELO DESTINADOR FINAL", 
                                `Manifestos emitidos de ${dateFromBeforeBefore.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`, 
                                filtrarTudoSemDataDeRecebimento(detailedReferencePeriodList || []),
                                ["Número MTR", "Data Emissão", "Destinador", "Resíduo", "Quantidade Indicada no MTR", "Situação"],
                            )}
                            disableButton={!hideChartManifestsPending}
                            setDisableButton={()=> {}}
                        >
                            {/* <Download /> Baixar PDF */}
                            Download <span className="material-icons">picture_as_pdf</span>
                        </SwitchButton>
                }

            </Switch>

        </div>
    )
}