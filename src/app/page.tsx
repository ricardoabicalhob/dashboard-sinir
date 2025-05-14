'use client'

import { useEffect } from "react"

export default function Home() {
  useEffect(()=> {
    console.log("Home page")
  }, [])
  return(
    <div>Home page</div>
  )
}
// 'use client'

// import { MTRResponseI } from "@/interfaces/mtr.interface"
// import { useQuery } from "react-query"
// import { checkDateWithinAPeriod, formatDateDDMMYYYYForMMDDYYYY, formatDateForAPI, subDatesEmDias } from "@/utils/fnUtils"
// import { useMemo, useState } from "react"
// import { subDays } from "date-fns"
// import { getMtrDetails } from "@/repositories/getMtrDetails"
// import { getMtrList } from "@/repositories/getMtrList"

// export default function Home() { 

//   const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5MTc5OCw5Njg3MiIsInJvbGUiOjEsImV4cCI6MTc0NTU3MTg2NX0.RAANDuPblg-LE_G6vD_6T7q6WAoh1eLyQIX24kSLuyeLpmHyQrrwGeEyPQOcOfznVAXrrcoBn2XS-jJL6Gfqiw"
//   const [ dateFrom, setDateFrom ] = useState<Date>(new Date("03/01/2025"))
//   const [ dateTo, setDateTo ] = useState<Date>(new Date("03/31/2025"))
//   const dateFromBefore = subDays(dateFrom, 90)
//   const dateToBefore = subDays(dateFrom, 1)

//   const { 
//     data: referencePeriodList, 
//     isFetching: isFetchingList,
//     isLoading: isLoadingList,
//     isError: isErrorList,
//     error: errorList
//   } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 1], 
//     async ()=> await getMtrList(91798, "Armazenador Temporário", formatDateForAPI(dateFrom), formatDateForAPI(dateTo), token, ["Recebido"]), {
//     refetchOnWindowFocus: false
//   })

//   const {
//     data: extendedPeriodList,
//     isLoading: isLoadingListExtented,
//     isError: isErrorListExtented,
//     error: errorListExtented
//   } = useQuery<MTRResponseI[], Error>(['referencePeriodListMtrs', 2], 
//     async ()=> await getMtrList(91798, "Armazenador Temporário", formatDateForAPI(dateFromBefore), formatDateForAPI(dateToBefore), token, ["Recebido"]), {
//       refetchOnWindowFocus: false,
//       enabled: true
//     }
//   )

//   const allMtrs = useMemo(() => {
//     if (referencePeriodList && extendedPeriodList) {
//       return [...referencePeriodList, ...extendedPeriodList];
//     }
//     if (referencePeriodList) {
//       return referencePeriodList;
//     }
//     if (extendedPeriodList) {
//       return extendedPeriodList;
//     }
//     return [];
//   }, [referencePeriodList, extendedPeriodList]);

//   const { 
//     data: detailedReferencePeriodList,
//     isLoading: isLoadingDetails,
//     isError: isErrorDetails,
//     error: errorDetails
//    } = useQuery<MTRResponseI[], Error>(['mtrDetails'], async ()=> await getMtrDetails(allMtrs || [], token),
//     {
//       enabled: !!extendedPeriodList
//     }
//   )

//   const isLoading = isLoadingList || isLoadingListExtented;
//   const isError = isErrorList || isErrorListExtented;
//   const error = errorList || errorListExtented;

//   if (isLoading) return <p>Carregando lista de MTRs...</p>;
//   if (isError && error) return <p>Erro ao carregar lista de MTRs: {error.message}</p>;

//   if (isLoadingDetails) return <p>Carregando detalhes dos MTRs...</p>;
//   if (isErrorDetails && errorDetails) return <p>Erro ao carregar detalhes dos MTRs: {errorDetails.message}</p>;

//   return (
//     <div className="flex p-6">
//       <ul className="list-disc">
//         { detailedReferencePeriodList?.map(mtr => {
//           if(!checkDateWithinAPeriod(dateFrom, dateTo, new Date(formatDateDDMMYYYYForMMDDYYYY(mtr.situacaoManifesto.simDataRecebimento) || ""))) {
//             return null
//           }
//           // if(!compareDates(dateFrom, dateTo, new Date(formatDateDDMMYYYYparaMMDDYYYY(mtr.dataRecebimentoAT) || ""))) {
//           //   return null
//           // }
//           return(
//             <li key={mtr.manNumero} className="flex flex-col w-fit mb-3"> 
//               <div className="flex gap-2">
//                 <strong>{mtr.manNumero}</strong>
//                 <p>{mtr.parceiroGerador.parDescricao}</p>
//               </div>
//               <div className="flex justify-between gap-2">
//                 <p>{mtr.listaManifestoResiduo[0].residuo.resDescricao}</p>
//                 <p>{mtr.listaManifestoResiduo[0].marQuantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
//                 <p>{mtr.listaManifestoResiduo[0].unidade.uniSigla}</p>
//               </div>
//               <div className="flex justify-between">
//                 <p>{`Emitido em ${new Date(mtr.manData).toLocaleDateString()}`}</p>
//                 <p>{`A vencer em ${90 - subDatesEmDias(new Date(mtr.manData), new Date(Date.now()))} dias`}</p>
//               </div>
//               <p>{`Armaz Temporário - Recebido em ${mtr.dataRecebimentoAT}`}</p>
//               <p>{`${mtr.situacaoManifesto.simDescricao} em ${mtr.situacaoManifesto.simDataRecebimento}`}</p>
//             </li>
//           )
//         }) }  
//       </ul>    
//     </div>
//   )
// }
