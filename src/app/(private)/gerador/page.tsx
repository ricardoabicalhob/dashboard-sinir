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
import { filterAllWithIssueDateWithinThePeriod, filterEverythingWithDateReceivedWithinThePeriod, filterEverythingWithoutAReceiptDateWithinThePeriod, groupByWasteType } from "@/utils/fnFilters"
import { formatDateDDMMYYYYForMMDDYYYY, formatDateForAPI } from "@/utils/fnUtils"
import { subDays } from "date-fns"
import { useContext, useEffect, useMemo, useState } from "react"
import { useQuery } from "react-query"

export default function GeradorPage() {
    const { 
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
        async ()=> await getMtrList("Gerador", formatDateForAPI(dateFrom), formatDateForAPI(dateTo), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
        refetchOnWindowFocus: false,
        enabled: !!profile?.objetoResposta.token && !!profile, 
    })
    
    const {
        data: extendedPeriodList,
        isSuccess: isSuccessListExtented,
        isError: isErrorListExtented,
        error: errorListExtented
    } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2, dateFromBefore, dateToBefore], 
        async ()=> await getMtrList("Gerador", formatDateForAPI(dateFromBefore), formatDateForAPI(dateToBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
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
        async ()=> await getMtrList("Gerador", formatDateForAPI(dateFromBeforeBefore), formatDateForAPI(dateToBeforeBefore), profile?.objetoResposta.token || "", profile?.objetoResposta.parCodigo), {
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

            <GraficoSimples
                title="Manifestos emitidos como gerador"
                subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                dataChart={groupByWasteType(filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo))}
            />

            <DialogListMTR listMtrs={filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)}/>
            
            {/* <ul className="list-disc">
                { filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)?.map(mtr => {
                
                return(
                    <li key={mtr.manNumero} className="flex flex-col w-fit mb-3"> 
                    <div className="flex gap-2">
                        <strong>{mtr.manNumero}</strong>
                        <p>{mtr.parceiroGerador.parDescricao}</p>
                    </div>
                    <div className="flex justify-between gap-2">
                        <p>{mtr.listaManifestoResiduo[0].residuo.resDescricao}</p>
                        <p>{mtr.listaManifestoResiduo[0].marQuantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p>{mtr.listaManifestoResiduo[0].unidade.uniSigla}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>{`Emitido em ${new Date(mtr.manData).toLocaleDateString()}`}</p>
                        <p>{`A vencer em ${90 - subDatesEmDias(new Date(mtr.manData), new Date(Date.now()))} dias`}</p>
                    </div>
                    <p>{`${mtr.dataRecebimentoAT && "Armaz Temporário - Recebido em" + mtr.dataRecebimentoAT}`}</p>
                    <p>{`${mtr.situacaoManifesto.simDataRecebimento ? mtr.situacaoManifesto.simDescricao : "Recebido"} em: ${mtr.situacaoManifesto.simDataRecebimento? mtr.situacaoManifesto.simDataRecebimento : "Pendente"}`}</p>
                    </li>
                )
                }) }  
            </ul>
            {
                detailedReferencePeriodList &&
                    groupByWasteType(filterAllWithIssueDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)).map(typeWaste => (
                        <div key={typeWaste.resDescricao} className="flex justify-between">
                            <p>{typeWaste.resDescricao}</p>
                            <p>Estimado: {typeWaste.quantidadeEstimada.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    ))
            } */}


            <GraficoBarraDupla
                title="Manifestos recebidos no destinador final"
                subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                dataChart={groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo))}
            />

            <DialogListMTR listMtrs={filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)} />

            {/* <ul className="list-disc">
                { filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)?.map(mtr => {
                
                return(
                    <li key={mtr.manNumero} className="flex flex-col w-fit mb-3"> 
                    <div className="flex gap-2">
                        <strong>{mtr.manNumero}</strong>
                        <p>{mtr.parceiroGerador.parDescricao}</p>
                    </div>
                    <div className="flex justify-between gap-2">
                        <p>{mtr.listaManifestoResiduo[0].residuo.resDescricao}</p>
                        <p>{mtr.listaManifestoResiduo[0].marQuantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p>{mtr.listaManifestoResiduo[0].unidade.uniSigla}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>{`Emitido em ${new Date(mtr.manData).toLocaleDateString()}`}</p>
                        <p>{`A vencer em ${90 - subDatesEmDias(new Date(mtr.manData), new Date(Date.now()))} dias`}</p>
                    </div>
                    <p>{`${mtr.dataRecebimentoAT && "Armaz Temporário - Recebido em" + mtr.dataRecebimentoAT}`}</p>
                    <p>{`${mtr.situacaoManifesto.simDataRecebimento ? mtr.situacaoManifesto.simDescricao : "Recebido"} em: ${mtr.situacaoManifesto.simDataRecebimento? mtr.situacaoManifesto.simDataRecebimento : "Pendente"}`}</p>
                    </li>
                )
                }) }  
            </ul>   
            
            {
                detailedReferencePeriodList &&
                groupByWasteType(filterEverythingWithDateReceivedWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)).map(typeWaste => (
                    <div key={typeWaste.resDescricao} className="flex justify-between">
                        <p>{typeWaste.resDescricao}</p>
                        <p>Estimado: {typeWaste.quantidadeEstimada.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p>Recebido: {typeWaste.quantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                ))
            } */}
            
            <GraficoSimples 
                title="Manifestos pendentes de recebimento no destinador final"
                subTitle={`Período: ${dateFrom.toLocaleDateString()} à ${dateTo.toLocaleDateString()}`}
                dataChart={groupByWasteType(filterEverythingWithoutAReceiptDateWithinThePeriod(detailedReferencePeriodList || []))}
            />

            <DialogListMTR listMtrs={filterEverythingWithoutAReceiptDateWithinThePeriod(detailedReferencePeriodList || [])} />

            {/* <ul className="list-disc">
                { filterEverythingWithoutAReceiptDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)?.map(mtr => {
                
                return(
                    <li key={mtr.manNumero} className="flex flex-col w-fit mb-3"> 
                    <div className="flex gap-2">
                        <strong>{mtr.manNumero}</strong>
                        <p>{mtr.parceiroGerador.parDescricao}</p>
                    </div>
                    <div className="flex justify-between gap-2">
                        <p>{mtr.listaManifestoResiduo[0].residuo.resDescricao}</p>
                        <p>{mtr.listaManifestoResiduo[0].marQuantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p>{mtr.listaManifestoResiduo[0].unidade.uniSigla}</p>
                    </div>
                    <div className="flex justify-between">
                        <p>{`Emitido em ${new Date(mtr.manData).toLocaleDateString()}`}</p>
                        <p>{`A vencer em ${90 - subDatesEmDias(new Date(mtr.manData), new Date(Date.now()))} dias`}</p>
                    </div>
                    <p>{`${mtr.dataRecebimentoAT && "Armaz Temporário - Recebido em" + mtr.dataRecebimentoAT}`}</p>
                    <p>{`${mtr.situacaoManifesto.simDataRecebimento ? mtr.situacaoManifesto.simDescricao : "Recebido"} em: ${mtr.situacaoManifesto.simDataRecebimento? mtr.situacaoManifesto.simDataRecebimento : "Pendente"}`}</p>
                    </li>
                )
                }) }  
            </ul>
            
            {
                detailedReferencePeriodList &&
                groupByWasteType(filterEverythingWithoutAReceiptDateWithinThePeriod(detailedReferencePeriodList || [], dateFrom, dateTo)).map(typeWaste => (
                    <div key={typeWaste.resDescricao} className="flex justify-between">
                        <p>{typeWaste.resDescricao}</p>
                        <p>Estimado: {typeWaste.quantidadeEstimada.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                ))
            } */}

        </div>
    )
}