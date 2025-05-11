import { MTRResponseI } from "@/interfaces/mtr.interface"
import { subtrairDatasEmDias } from "@/utils/fnUtils"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { List } from "lucide-react"

interface DialogListMTRProps {
    listMtrs :MTRResponseI[]
}

export default function DialogListMTR({ listMtrs } :DialogListMTRProps) {
    return(
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex w-fit h-fit p-2 gap-2 rounded-full shadow-md shadow-gray-500 bg-[#00BCD4] cursor-pointer">
                    <List className="text-white select-none w-4 h-4"/>
                </div>
            </PopoverTrigger>
            <PopoverContent className="flex w-[860px] h-[400px] justify-center items-center mx-8 overflow-y-auto">
                <ul className="w-full h-full list-disc">
                    { listMtrs?.map(mtr => {
                    
                    return(
                        <li key={mtr.manNumero} className="flex flex-col w-full mb-3 p-2 rounded-sm hover:bg-gray-100"> 
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
                            <p>{`A vencer em ${90 - subtrairDatasEmDias(new Date(mtr.manData), new Date(Date.now()))} dias`}</p>
                        </div>
                        <p>{`${mtr.dataRecebimentoAT && "Armaz Temporário - Recebido em " + mtr.dataRecebimentoAT}`}</p>
                        <p>{`${mtr.situacaoManifesto.simDataRecebimento ? mtr.situacaoManifesto.simDescricao : "Recebido"} em: ${mtr.situacaoManifesto.simDataRecebimento? mtr.situacaoManifesto.simDataRecebimento : "Pendente"}`}</p>
                        </li>
                    )
                    }) }  
                </ul>
            </PopoverContent>
        </Popover>
    )
}