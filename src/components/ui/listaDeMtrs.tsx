import { Printer } from "lucide-react";
import { Card, CardHeader, CardTitle } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { downloadMtr } from "@/repositories/downloadMtr";
import { MTRResponseI } from "@/interfaces/mtr.interface";
import { useEffect, useRef } from "react";

interface ListaDeMtrsProps {
    listMtrs :MTRResponseI[]
    title :string
    authorization :string
    armazenamentoTemporario? :boolean
}

export default function ListaDeMtrs({ listMtrs, title, authorization, armazenamentoTemporario } :ListaDeMtrsProps) {

    const cardListRef = useRef<HTMLDivElement>(null)

    const handleDownloadMtr = async (numeroMtr :string, authorization :string) => {
        await downloadMtr(numeroMtr, authorization)
    }

    useEffect(()=> {
        setTimeout(() => {
            if(cardListRef.current) {
                cardListRef.current.classList.remove("opacity-0")
                cardListRef.current.classList.add("opacity-100")
            }
        }, 100);
    }, [])

    return(
        <Card ref={cardListRef} className="opacity-0 transition-opacity duration-700">
            <CardHeader>
                <CardTitle className="text-xl text-black/50 text-center font-semibold">{title}</CardTitle>
            </CardHeader>
            <div className="flex h-[373px] p-2 rounded-md shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>MTR Nº</TableHead>
                            <TableHead>Data Emissão</TableHead>
                            <TableHead>Gerador</TableHead>
                            <TableHead>Destinador</TableHead>
                            {armazenamentoTemporario && <TableHead>Data Recebimento AT</TableHead>}
                            {!armazenamentoTemporario && <TableHead>Data Recebimento</TableHead>}
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            listMtrs.map(mtr => (
                                <TableRow key={mtr.manNumero}>
                                    <TableCell><span>{mtr.manNumero}</span></TableCell>
                                    <TableCell>{new Date(mtr.manData).toLocaleDateString()}</TableCell>
                                    <TableCell>{mtr.parceiroGerador.parDescricao}</TableCell>
                                    <TableCell>{mtr.parceiroDestinador.parDescricao}</TableCell>
                                    {armazenamentoTemporario && <TableCell>{mtr.dataRecebimentoAT}</TableCell>}
                                    {!armazenamentoTemporario &&<TableCell>{mtr.situacaoManifesto.simDataRecebimento}</TableCell>}
                                    <TableCell className="flex justify-center">
                                        <div
                                            className="w-fit px-2 cursor-pointer"
                                            onClick={async ()=> handleDownloadMtr(mtr.manNumero, authorization)}     
                                        >
                                            <Printer fill="#00695C" fillOpacity={.1} className="w-5 h-5 text-[#00695C]" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        </Card>
    )
}