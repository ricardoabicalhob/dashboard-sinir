import { MTRResponseI } from "@/interfaces/mtr.interface";
import { checkDateWithinAPeriod, formatDateDDMMYYYYForMMDDYYYY } from "./fnUtils";

interface WasteQuantities {
    quantidadeEstimada: number
    quantidadeRecebida: number
}

interface GroupByWasteType {
    [codigoIbama :string] :WasteQuantities
}

export interface GroupByWasteTypeOutput {
    resDescricao :string
    quantidadeEstimada :number
    quantidadeRecebida :number
}

export function groupByWasteType(listMtrs :MTRResponseI[]) :GroupByWasteTypeOutput[] {
    const quantidadesPorCodigoIbama = listMtrs.reduce((acumulador :GroupByWasteType, mtr) => {
            mtr.listaManifestoResiduo.forEach(residuo => {
                const resDescricao = residuo.residuo.resDescricao
                const quantidadeEstimada = residuo.marQuantidade
                const quantidadeRecebida = residuo.marQuantidadeRecebida

                if (!acumulador[resDescricao]) {
                    acumulador[resDescricao] = { quantidadeEstimada: 0, quantidadeRecebida: 0 };
                }

                acumulador[resDescricao].quantidadeEstimada += quantidadeEstimada;
                acumulador[resDescricao].quantidadeRecebida += quantidadeRecebida;
            })
            return acumulador
        }, {})

    return Object.entries(quantidadesPorCodigoIbama).map(([resDescricao, quantidades ]) => ({
        resDescricao: resDescricao,
        quantidadeEstimada: quantidades.quantidadeEstimada,
        quantidadeRecebida: quantidades.quantidadeRecebida
    }))
}

export function filterAllWithIssueDateWithinThePeriod(listMtrs :MTRResponseI[], dateFrom :Date, dateTo :Date) {
    const listMtrsFiltered :MTRResponseI[] = []

    listMtrs
        .map(mtr => {
            if(!checkDateWithinAPeriod(dateFrom, dateTo, new Date(formatDateDDMMYYYYForMMDDYYYY(new Date(mtr.manData).toLocaleDateString()) || ""))) {
                return null
            }
            listMtrsFiltered.push(mtr)
        })
    return listMtrsFiltered
}

export function filterEverythingWithDateReceivedWithinThePeriod(listMtrs :MTRResponseI[], dateFrom :Date, dateTo :Date) {
    const listMtrsFiltered :MTRResponseI[] = []

    listMtrs
        .map(mtr => {
            if(mtr.situacaoManifesto.simDataRecebimento && !checkDateWithinAPeriod(dateFrom, dateTo, new Date(formatDateDDMMYYYYForMMDDYYYY(mtr.situacaoManifesto.simDataRecebimento) || ""))) {
                return null
            }

            if(!mtr.situacaoManifesto.simDataRecebimento) {
                return null
            }
            listMtrsFiltered.push(mtr)
        })
    return listMtrsFiltered
}

export function filterEverythingWithDateReceivedInTemporaryStorageWithinThePeriod(listMtrs :MTRResponseI[], dateFrom :Date, dateTo :Date) {
    const listMtrsFiltered :MTRResponseI[] = []

    listMtrs
        .map(mtr => {
            if(!mtr.dataRecebimentoAT) {
                return null
            }

            if(mtr.dataRecebimentoAT && !checkDateWithinAPeriod(dateFrom, dateTo, new Date(formatDateDDMMYYYYForMMDDYYYY(mtr.dataRecebimentoAT) || ""))) {
                return null    
            }
            listMtrsFiltered.push(mtr)
        })
    return listMtrsFiltered
}

export function filterStockFromTemporaryStorage(listMtrs :MTRResponseI[]) {
    return listMtrs
        .filter(mtr => {
            return mtr.situacaoManifesto.simDescricao === "Armaz Temporário"
        })
}

// export function filterEverythingWithoutAReceiptDateWithinThePeriod(listMtrs :MTRResponseI[], dateFrom :Date, dateTo :Date) {
export function filterEverythingWithoutAReceiptDateWithinThePeriod(listMtrs :MTRResponseI[]) {
    const listMtrsFiltered :MTRResponseI[] = []

    listMtrs
        .map(mtr => {
            // if(mtr.situacaoManifesto.simDataRecebimento && !checkDateWithinAPeriod(dateFrom, dateTo, new Date(formatDateDDMMYYYYForMMDDYYYY(mtr.situacaoManifesto.simDataRecebimento) || ""))) {
            //     return null
            // }

            if(mtr.situacaoManifesto.simDataRecebimento) {
                return null
            }
            listMtrsFiltered.push(mtr)
        })
    return listMtrsFiltered
}