'use client'

import CustomMessage from "@/components/customMessage"
import GraficoBarraDupla from "@/components/graficoBarraDupla"
import { Scoreboard, ScoreboardItem, ScoreboardMainText, ScoreboardSubtitle, ScoreboardTitle } from "@/components/scoreboard"
import { Switch, SwitchButton } from "@/components/switch"
import TabelaDemonstrativaSimples from "@/components/tabelaDemonstrativaSimples"
import ListaDeMtrs from "@/components/ui/listaDeMtrs"
import { AuthContext } from "@/contexts/auth.context"
import { SystemContext } from "@/contexts/system.context"
import { LoginResponseI } from "@/interfaces/login.interface"
import { MTRResponseI } from "@/interfaces/mtr.interface"
import { getMtrDetails } from "@/repositories/getMtrDetails"
import { getMtrList } from "@/repositories/getMtrList"
import { filtrarTudoComDataDeRecebimentoDentroDoPeriodo, agruparPorGerador, agruparPorTipoDeResiduo, agruparPorDestinador } from "@/utils/fnFilters"
import { formatarDataDDMMYYYYParaMMDDYYYY, formatarDataParaAPI, totalizarQuantidadeRecebida } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { ChartColumnBig, List, Sheet } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function VisaoGeralPage() {

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
    const [ showChartManifestsReceivedSentFromTheGenerator, setShowChartManifestsReceivedSentFromTheGenerator ] = useState(false)
    const [ showListManifestsReceivedSentFromTheGenerator, setShowListManifestsReceivedSentFromTheGenerator ] = useState(true)
    const [ showTableManifestsReceivedSentFromTheGenerator, setShowTableManifestsReceivedSentFromTheGenerator ] = useState(true)
    const [ showChartManifestsReceivedSentFromAT, setShowChartManifestsReceivedSentFromAT ] = useState(false)
    const [ showListManifestsReceivedSentFromAT, setShowListManifestsReceivedSentFromAT ] = useState(true)
    const [ showTableManifestsReceivedSentFromAT, setShowTableManifestsReceivedSentFromAT ] = useState(true)
    const [ showTableATOriginDetails, setShowTableATOriginDetails ] = useState(true)
    const [ showChartManifestsReceivedSentFromTheGeneratorAndAT, setShowChartManifestsReceivedSentFromTheGeneratorAndAT ] = useState(false)
    const [ showListManifestsReceivedSentFromTheGeneratorAndAT, setShowListManifestsReceivedSentFromTheGeneratorAndAT ] = useState(true)
    const [ showTableManifestsReceivedSentFromTheGeneratorAndAT, setShowTableManifestsReceivedSentFromTheGeneratorAndAT ] = useState(true)
    const [ showTableDetailsManifestsReceivedSentFromTheGeneratorAndAT, setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT ] = useState(true)
    
    function handleShowTableManifestsReceivedSentFromTheGenerator() {
        setShowTableManifestsReceivedSentFromTheGenerator(false)
        setShowListManifestsReceivedSentFromTheGenerator(true)
        setShowChartManifestsReceivedSentFromTheGenerator(true)
    }

    function handleShowListManifestsReceivedSentFromTheGenerator() {
        setShowListManifestsReceivedSentFromTheGenerator(false)
        setShowChartManifestsReceivedSentFromTheGenerator(true)
        setShowTableManifestsReceivedSentFromTheGenerator(true)
    }

    function handleShowChartManifestsReceivedSentFromTheGenerator() {
        setShowChartManifestsReceivedSentFromTheGenerator(false)
        setShowListManifestsReceivedSentFromTheGenerator(true)
        setShowTableManifestsReceivedSentFromTheGenerator(true)
    }

    function handleShowTableManifestsReceivedSentFromAT() {
        setShowTableManifestsReceivedSentFromAT(false)
        setShowListManifestsReceivedSentFromAT(true)
        setShowChartManifestsReceivedSentFromAT(true)
        setShowTableATOriginDetails(true)
    }

    function handleShowListManifestsReceivedSentFromAT() {
        setShowListManifestsReceivedSentFromAT(false)
        setShowChartManifestsReceivedSentFromAT(true)
        setShowTableManifestsReceivedSentFromAT(true)
        setShowTableATOriginDetails(true)

    }

    function handleShowChartManifestsReceivedSentFromAT() {
        setShowChartManifestsReceivedSentFromAT(false)
        setShowListManifestsReceivedSentFromAT(true)
        setShowTableManifestsReceivedSentFromAT(true)
        setShowTableATOriginDetails(true)
    }

    function handleShowTableATOriginDetails() {
        setShowTableATOriginDetails(false)
        setShowChartManifestsReceivedSentFromAT(true)
        setShowListManifestsReceivedSentFromAT(true)
        setShowTableManifestsReceivedSentFromAT(true)
    }

    function handleShowChartManifestsReceivedSentFromTheGeneratorAndAT() {
        setShowChartManifestsReceivedSentFromTheGeneratorAndAT(false)
        setShowListManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowTableManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT(true)
    }

    function handleShowListManifestsReceivedSentFromTheGeneratorAndAT() {
        setShowListManifestsReceivedSentFromTheGeneratorAndAT(false)
        setShowTableManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowChartManifestsReceivedSentFromTheGeneratorAndAT(true)

    }

    function handleShowTableManifestsReceivedSentFromTheGeneratorAndAT() {
        setShowTableManifestsReceivedSentFromTheGeneratorAndAT(false)
        setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowListManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowChartManifestsReceivedSentFromTheGeneratorAndAT(true)
    }

    function handleShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT() {
        setShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT(false)
        setShowChartManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowListManifestsReceivedSentFromTheGeneratorAndAT(true)
        setShowTableManifestsReceivedSentFromTheGeneratorAndAT(true)
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
        data: referencePeriodListGerador, 
        isSuccess: isSuccessListGerador,
        isError: isErrorListGerador,
        error: errorListGerador
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsGerador', 1, dateFrom], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile, 
    })
    
    const {
        data: extendedPeriodListGerador,
        isSuccess: isSuccessListExtentedGerador,
        isError: isErrorListExtentedGerador,
        error: errorListExtentedGerador
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsGerador', 2, dateFromBefore], 
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
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
        async ()=> await getMtrList("Gerador", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
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
        async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFrom), formatarDataParaAPI(dateTo), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedPeriodListAT,
        isSuccess: isSuccessListExtentedAT,
        isError: isErrorListExtentedAT,
        error: errorListExtentedAT
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsAT', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFromBefore), formatarDataParaAPI(dateToBefore), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]), {
        refetchOnWindowFocus: false,
        enabled: !!token && !!profile
    })

    const {
        data: extendedMorePeriodListAT,
        isSuccess: isSuccessListExtentedMoreAT,
        isError: isErrorListExtentedMoreAT,
        error: errorListExtentedMoreAT
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrsAT', 3, dateFromBeforeBefore, dateToBeforeBefore], 
        async ()=> await getMtrList("Armazenador Temporário", formatarDataParaAPI(dateFromBeforeBefore), formatarDataParaAPI(dateToBeforeBefore), token || "", profile?.objetoResposta.parCodigo, ["Armaz Temporário", "Armaz Temporário - Recebido", "Recebido"]), {
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

    return(
        <div className="flex flex-col gap-6 p-6">

            <Scoreboard>
                <ScoreboardItem>
                    <ScoreboardTitle>Movimentação de gerador para destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida</ScoreboardSubtitle>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Movimentação de armazenamento temporário para destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}</ScoreboardSubtitle>
                    <ScoreboardMainText className="text-gray-400">{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo))).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida</ScoreboardSubtitle>
                </ScoreboardItem>
                <ScoreboardItem>
                    <ScoreboardTitle>Movimentação total para destinador final</ScoreboardTitle>
                    <ScoreboardSubtitle>{`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}</ScoreboardSubtitle>
                    <ScoreboardMainText>{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo([
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                    ])).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</ScoreboardMainText>
                    <ScoreboardSubtitle>Quantidade recebida</ScoreboardSubtitle>
                </ScoreboardItem>
            </Scoreboard>

            {!showChartManifestsReceivedSentFromTheGenerator &&
                <GraficoBarraDupla
                    title="Resíduos recebidos no destinador (saída do gerador)"
                    subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo)))}
                    dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo))}
                />}

            {!showListManifestsReceivedSentFromTheGenerator &&
                <ListaDeMtrs
                    title="Manifestos recebidos no destinador (saída do gerador)"
                    listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo)}
                    authorization={profile?.objetoResposta.token || ""}
                    options={["Gerador", "Destinador", "Situação", "Data Recebimento"]}
                />}

            {!showTableManifestsReceivedSentFromTheGenerator &&
                <TabelaDemonstrativaSimples
                    tipo="Destinador"
                    title="Detalhes da destinação (saída do gerador)"
                    listaAgrupadaPorDestinadorOuGerador={agruparPorDestinador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo))}
                />}

            <Switch>
                <SwitchButton
                    disableButton={!showChartManifestsReceivedSentFromTheGenerator}
                    setDisableButton={()=> handleShowChartManifestsReceivedSentFromTheGenerator()}
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                     
                </SwitchButton>
                <SwitchButton
                    disableButton={!showListManifestsReceivedSentFromTheGenerator}
                    setDisableButton={()=> handleShowListManifestsReceivedSentFromTheGenerator()}
                >
                    <List className="w-4 h-4 text-white"/> Lista de manifestos
                </SwitchButton>
                <SwitchButton
                    disableButton={!showTableManifestsReceivedSentFromTheGenerator}
                    setDisableButton={()=> handleShowTableManifestsReceivedSentFromTheGenerator()}
                >
                    <Sheet className="w-4 h-4 text-white"/> Detalhes da destinação
                </SwitchButton>
            </Switch>

            {!showChartManifestsReceivedSentFromAT &&
                <GraficoBarraDupla
                    title="Resíduos recebidos no destinador (saída do armazenamento temporário)"
                    subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)))}
                    dataChart={agruparPorTipoDeResiduo(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo))}
                />}

            {!showListManifestsReceivedSentFromAT &&
                <ListaDeMtrs
                    title="Manifestos recebidos no destinador (saída do armazenamento temporário)"
                    listMtrs={filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)}
                    authorization={profile?.objetoResposta.token || ""}
                    options={["Gerador", "Destinador", "Situação", "Data Recebimento"]}
                />}

            {!showTableATOriginDetails &&
                <TabelaDemonstrativaSimples
                    tipo="Gerador"
                    title="Detalhes de origem dos resíduos (saída do armazenamento temporário)"
                    listaAgrupadaPorDestinadorOuGerador={agruparPorGerador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo))}
                />}

            {!showTableManifestsReceivedSentFromAT &&
                <TabelaDemonstrativaSimples
                    tipo="Destinador"
                    title="Detalhes da destinação (saída do armazenamento temporário)"
                    listaAgrupadaPorDestinadorOuGerador={agruparPorDestinador(filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo))}
                />}

            <Switch>
                <SwitchButton
                    disableButton={!showChartManifestsReceivedSentFromAT}
                    setDisableButton={()=> handleShowChartManifestsReceivedSentFromAT()}
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                     
                </SwitchButton>
                <SwitchButton
                    disableButton={!showListManifestsReceivedSentFromAT}
                    setDisableButton={()=> handleShowListManifestsReceivedSentFromAT()}
                >
                    <List className="w-4 h-4 text-white"/> Lista de manifestos
                </SwitchButton>
                <SwitchButton
                    disableButton={!showTableATOriginDetails}
                    setDisableButton={()=> handleShowTableATOriginDetails()}
                >
                    <Sheet className="w-4 h-4 text-white"/> Detalhes da origem
                </SwitchButton>
                <SwitchButton
                    disableButton={!showTableManifestsReceivedSentFromAT}
                    setDisableButton={()=> handleShowTableManifestsReceivedSentFromAT()}
                >
                    <Sheet className="w-4 h-4 text-white"/> Detalhes da destinação
                </SwitchButton>
            </Switch>

            {!showChartManifestsReceivedSentFromTheGeneratorAndAT &&
                <GraficoBarraDupla 
                    title="Total de destinação de resíduos (saída de resíduos do gerador + armazenamento temporário)"
                    subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                    acumulated={totalizarQuantidadeRecebida(agruparPorTipoDeResiduo([
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                    ]))}
                    dataChart={agruparPorTipoDeResiduo([
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                        ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                    ])}
                />}

        
            {!showListManifestsReceivedSentFromTheGeneratorAndAT &&
                (!!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo).length ||
                !!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo).length) &&
                    <ListaDeMtrs
                        title="Manifestos recebidos (saída de resíduos do gerador + armazenamento temporário)"
                        listMtrs={[
                            ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo),
                            ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                        ]}
                        authorization={token || ""} 
                        options={["Gerador", "Destinador", "Situação", "Data Recebimento"]}
                    />
            }

            {!showTableDetailsManifestsReceivedSentFromTheGeneratorAndAT &&
                (!!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo).length &&
                 !!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo).length) &&
                    <>
                        <TabelaDemonstrativaSimples
                            tipo="Gerador"
                            title="Detalhes da saída de resíduos do gerador + armazenamento temporário"
                            listaAgrupadaPorDestinadorOuGerador={agruparPorGerador([...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo),
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo)])}
                        />

                    </>
            }

            
            {!showTableManifestsReceivedSentFromTheGeneratorAndAT &&
                (!!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo).length ||
                !!filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo).length) &&
                    <>
                        <TabelaDemonstrativaSimples 
                            tipo="Destinador"
                            title="Detalhes da destinação de resíduos do gerador + armazenador temporário"
                            listaAgrupadaPorDestinadorOuGerador={agruparPorDestinador([
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                            ])}
                        />
                        {/* <TabelaDemonstrativaCompleta 
                            title="Detalhes da destinação de resíduos do gerador + armazenador temporário"
                            listaAgrupadaPorDestinadorEGerador={agruparPorGeradorEDestinador([
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListGerador || [], dateFrom, dateTo), 
                                ...filtrarTudoComDataDeRecebimentoDentroDoPeriodo(detailedReferencePeriodListAT || [], dateFrom, dateTo)
                            ])}
                        /> */}
                    </>
            }

            <Switch>
                <SwitchButton
                    disableButton={!showChartManifestsReceivedSentFromTheGeneratorAndAT}
                    setDisableButton={()=> handleShowChartManifestsReceivedSentFromTheGeneratorAndAT()}
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/> Gráfico                     
                </SwitchButton>
                <SwitchButton
                    disableButton={!showListManifestsReceivedSentFromTheGeneratorAndAT}
                    setDisableButton={()=> handleShowListManifestsReceivedSentFromTheGeneratorAndAT()}
                >
                    <List className="w-4 h-4 text-white"/> Lista de manifestos
                </SwitchButton>
                <SwitchButton
                    disableButton={!showTableDetailsManifestsReceivedSentFromTheGeneratorAndAT}
                    setDisableButton={()=> handleShowTableDetailsManifestsReceivedSentFromTheGeneratorAndAT()}
                >
                    <Sheet className="w-4 h-4 text-white"/> Detalhes da origem
                </SwitchButton>
                <SwitchButton
                    disableButton={!showTableManifestsReceivedSentFromTheGeneratorAndAT}
                    setDisableButton={()=> handleShowTableManifestsReceivedSentFromTheGeneratorAndAT()}
                >
                    <Sheet className="w-4 h-4 text-white"/> Detalhes da destinação
                </SwitchButton>
            </Switch>

        </div>
    )
}