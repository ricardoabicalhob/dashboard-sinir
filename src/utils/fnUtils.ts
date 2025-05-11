import { format } from "date-fns"
import { GroupByWasteTypeOutput } from "./fnFilters";

export function subtrairDatasEmDias(initialDate :Date, finalDate :Date) {
    const tempoInicial = initialDate.getTime();
    const tempoFinal = finalDate.getTime();
    const diferencaEmMilissegundos = tempoFinal - tempoInicial;
    const milissegundosEmUmDia = 1000 * 60 * 60 * 24;
    return Math.floor(diferencaEmMilissegundos / milissegundosEmUmDia);
}

export function formatarDataDDMMYYYYParaMMDDYYYY(dataString: string): string | null {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = dataString.match(regex)
  
    if (!match) {
      console.error("Formato de data inválido. Esperado: dd/mm/yyyy")
      return null
    }
  
    const dia = match[1]
    const mes = match[2]
    const ano = match[3]
  
    return `${mes}/${dia}/${ano}`
  }

export function verificarDataEstaDentroDoPeriodo(referenceDateFrom :Date, referenceDateTo :Date, dateToCompare :Date) {
    
    if(dateToCompare >= referenceDateFrom && dateToCompare <= referenceDateTo) {
        return true
    }
    return false
}

export function formatarDataParaAPI (date :Date) {
    return format(date, "dd-MM-yyyy")
}

export function totalizarQuantidadeRecebida(dataToTotalize :GroupByWasteTypeOutput[]) {
    const totalReceived = dataToTotalize.reduce((acumulador, item) => {
        return acumulador += item.quantidadeRecebida
    }, 0)
    return totalReceived
}

export function totalizarQuantidadeApontadaNoManifesto(dataToTotalize :GroupByWasteTypeOutput[]) {
    const totalEstimated = dataToTotalize.reduce((acumulador, item) => {
        return acumulador += item.quantidadeEstimada
    }, 0)
    return totalEstimated
}