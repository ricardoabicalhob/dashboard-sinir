import { FileText, Printer } from "lucide-react";
import { Card, CardHeader, CardTitle } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { downloadMtr } from "@/repositories/downloadMtr";
import { MTRResponseI } from "@/interfaces/mtr.interface";
import { useEffect, useRef } from "react";
import { downloadCdf } from "@/repositories/downloadCDF";

type FilterColumns = "Gerador" | "Destinador" | "Armazenador Temporário" | "Transportador" | "Situação" | "Data Recebimento AT" | "Data Recebimento"

interface ListaDeMtrsProps {
    listMtrs :MTRResponseI[]
    title :string
    authorization :string
    options :FilterColumns[]
}

export default function ListaDeMtrs({ listMtrs, title, authorization, options } :ListaDeMtrsProps) {

    const cardListRef = useRef<HTMLDivElement>(null)

    const handleDownloadMtr = async (numeroMtr :string, authorization :string) => {
        await downloadMtr(numeroMtr, authorization)
    }

    const handleDownloadCdf = async (numeroCdf :number, authorization :string) => {
        await downloadCdf(numeroCdf, authorization)
    }

    useEffect(()=> {
        setTimeout(() => {
            if(cardListRef.current) {
                cardListRef.current.classList.remove("opacity-0")
                cardListRef.current.classList.add("opacity-100")
            }
        }, 100)
    }, [])

    return(
        <Card ref={cardListRef} className="opacity-0 transition-opacity duration-700">
            <CardHeader>
                <CardTitle className="text-xl text-black/50 text-center font-semibold">{title}</CardTitle>
            </CardHeader>
            <div className="flex flex-col justify-between h-[373px] p-2 rounded-md shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>MTR Nº</TableHead>
                            <TableHead>Data Emissão</TableHead>
                            {options.includes("Armazenador Temporário") && <TableHead>Armazenador Temporário</TableHead>}
                            {options.includes("Gerador") && <TableHead>Gerador</TableHead>}
                            {options.includes("Transportador") && <TableHead>Transportador</TableHead>}
                            {options.includes("Destinador") && <TableHead>Destinador</TableHead>}
                            {options.includes("Situação") && <TableHead>Situação</TableHead>}
                            {options.includes("Data Recebimento AT") && <TableHead>Data Recebimento AT</TableHead>}
                            {options.includes("Data Recebimento") && <TableHead>Data Recebimento</TableHead>}
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            listMtrs.map(mtr => (
                                <TableRow className="hover:bg-[#00695C20]" key={mtr.manNumero}>
                                    <TableCell><span>{mtr.manNumero}</span></TableCell>
                                    <TableCell>{new Date(mtr.manData).toLocaleDateString()}</TableCell>
                                    {options.includes("Armazenador Temporário") && <TableCell>{mtr.parceiroArmazenadorTemporario.parDescricao}</TableCell>}
                                    {options.includes("Gerador") && <TableCell>{mtr.parceiroGerador.parDescricao}</TableCell>}
                                    {options.includes("Transportador") && <TableCell>{mtr.parceiroTransportador.parDescricao}</TableCell>}
                                    {options.includes("Destinador") && <TableCell>{mtr.parceiroDestinador.parDescricao}</TableCell>}
                                    {options.includes("Situação") && <TableCell>{mtr.situacaoManifesto.simDescricao}</TableCell>}
                                    {options.includes("Data Recebimento AT") && <TableCell>{mtr.dataRecebimentoAT}</TableCell>}
                                    {options.includes("Data Recebimento") &&<TableCell>{mtr.situacaoManifesto.simDataRecebimento}</TableCell>}
                                    <TableCell className="flex justify-start">
                                        <div
                                            className="w-fit mx-1 cursor-pointer"
                                            onClick={async ()=> handleDownloadMtr(mtr.manNumero, authorization)}     
                                        >
                                            <Printer fill="#00695C" fillOpacity={.1} className="w-5 h-5 text-[#00695C]" />
                                        </div>
                                        {
                                            mtr.cdfNumero && 
                                            <div
                                                className="w-fit px-2 cursor-pointer"
                                                onClick={()=> handleDownloadCdf(mtr.cdfNumero, authorization)}
                                            >
                                                <FileText fill="#00695C" fillOpacity={.1} className="w-5 h-5 text-[#00695C]" />
                                            </div>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                <span className="text-sm font-light">{`${listMtrs.length} manifestos`}</span>
            </div>
        </Card>
    )
}