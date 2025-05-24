import { Dock, FileCheck2, FileText, Printer } from "lucide-react";
import { Card, CardHeader, CardTitle } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { downloadMtr } from "@/repositories/downloadMtr";
import { MTRResponseI } from "@/interfaces/mtr.interface";
import { useEffect, useRef } from "react";
import { downloadCdf } from "@/repositories/downloadCDF";
import { downloadMtrComplementar } from "@/repositories/downloadMtrComplementar";
import { downloadRecebimentoMtr } from "@/repositories/downloadRecebimento";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type FilterColumns = "Gerador" | "Destinador" | "Armazenador Temporário" | "Transportador" | "Situação" | "Data Recebimento AT" | "Data Recebimento" | "Resíduo" | "Quantidade Indicada no MTR" | "Quantidade Recebida"

interface ListaDeMtrsProps {
    listMtrs :MTRResponseI[]
    title :string
    subtitle :string
    authorization :string
    options :FilterColumns[]
}

export default function ListaDeMtrs({ listMtrs, title, subtitle, authorization, options } :ListaDeMtrsProps) {

    const cardListRef = useRef<HTMLDivElement>(null)

    const handleDownloadMtr = async (numeroMtr :string, authorization :string) => {
        await downloadMtr(numeroMtr, authorization)
    }

    const handleDownloadCdf = async (numeroCdf :number, authorization :string) => {
        await downloadCdf(numeroCdf, authorization)
    }

    const handleDownloadMtrComplementar = async (manCodigoMtrComplementar :string | null, authorization :string) => {
        if(manCodigoMtrComplementar) {
            await downloadMtrComplementar(manCodigoMtrComplementar, authorization)
        }
    }

    const handleDownloadRecebimentoMtr = async (manHashCode :string, manNumero :string, authorization :string) => {
        await downloadRecebimentoMtr(manHashCode, manNumero, authorization)
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
                <CardTitle className="font-light text-center">{subtitle}</CardTitle>
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
                            {options.includes("Resíduo") && <TableHead>Resíduo</TableHead>}
                            {options.includes("Quantidade Indicada no MTR") && <TableHead>Quantidade Indicada no MTR</TableHead>}
                            {options.includes("Quantidade Recebida") && <TableHead>Quantidade Recebida</TableHead>}
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
                                    {options.includes("Armazenador Temporário") && <TableCell>{mtr.parceiroArmazenadorTemporario.parDescricao || "Não possui"}</TableCell>}
                                    {options.includes("Gerador") && <TableCell>{`${mtr.parceiroGerador.parCodigo} - ${mtr.parceiroGerador.parDescricao}`}</TableCell>}
                                    {options.includes("Transportador") && <TableCell>{`${mtr.parceiroTransportador.parCodigo} - ${mtr.parceiroTransportador.parDescricao}`}</TableCell>}
                                    {options.includes("Destinador") && <TableCell>{`${mtr.parceiroDestinador.parCodigo} - ${mtr.parceiroDestinador.parDescricao}`}</TableCell>}
                                    {options.includes("Resíduo") && <TableCell>{`${mtr.listaManifestoResiduo[0].residuo.resCodigoIbama} - ${mtr.listaManifestoResiduo[0].residuo.resDescricao}`}</TableCell>}
                                    {options.includes("Quantidade Indicada no MTR") && <TableCell>{mtr.listaManifestoResiduo[0].marQuantidade.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>}
                                    {options.includes("Quantidade Recebida") && <TableCell>{mtr.listaManifestoResiduo[0].marQuantidadeRecebida?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}</TableCell>}
                                    {options.includes("Situação") && <TableCell>{mtr.situacaoManifesto.simDescricao}</TableCell>}
                                    {options.includes("Data Recebimento AT") && <TableCell>{mtr.dataRecebimentoAT || "-"}</TableCell>}
                                    {options.includes("Data Recebimento") &&<TableCell>{mtr.situacaoManifesto.simDataRecebimento}</TableCell>}
                                    <TableCell className="flex justify-start">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="w-fit px-2 py-2 cursor-pointer rounded-full hover:bg-[#00BCD430]"
                                                    onClick={async ()=> handleDownloadMtr(mtr.manNumero, authorization)}     
                                                >
                                                    <Printer fill="#00695C" fillOpacity={.1} className="w-5 h-5 text-[#00695C]" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-[#00695C]">
                                                <span>Download MTR</span>
                                            </TooltipContent>
                                        </Tooltip>
                                        {
                                            mtr.cdfNumero && 
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            className="w-fit px-2 py-2 cursor-pointer rounded-full hover:bg-[#00BCD430]"
                                                            onClick={()=> handleDownloadCdf(mtr.cdfNumero, authorization)}
                                                        >
                                                            <FileText fill="#00695C" fillOpacity={.1} className="w-5 h-5 text-[#00695C]" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-[#00695C]">
                                                        <span>Download Certificado de Destinação Final</span>
                                                    </TooltipContent>
                                                </Tooltip>
                                        }
                                        {
                                            !mtr.cdfNumero &&
                                                <div className="w-fit px-2">
                                                    <div className="w-5 h-5" />
                                                </div>
                                        }
                                        {
                                            mtr.situacaoManifesto.simDataRecebimento &&
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            className="w-fit px-2 py-2 cursor-pointer rounded-full hover:bg-[#00BCD430]"
                                                            onClick={()=> handleDownloadRecebimentoMtr(mtr.manHashCode, mtr.manNumero, authorization)}
                                                        >
                                                            <FileCheck2 fill="#00695C" fillOpacity={.1} className="w-5 h-5 text-[#00695C]" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-[#00695C]">
                                                        <span>Download Recebimento</span>
                                                    </TooltipContent>
                                                </Tooltip>
                                        }
                                        {
                                            !mtr.situacaoManifesto.simDataRecebimento &&
                                                <div className="w-fit px-2">
                                                    <div className="w-5 h-5" />
                                                </div>
                                        }
                                        {
                                            mtr.temMtrComplementar &&
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            className="w-fit px-2 py-2 cursor-pointer rounded-full hover:bg-[#00BCD430]"
                                                            onClick={()=> handleDownloadMtrComplementar(mtr.manCodigoMtrComplementar, authorization)}
                                                        >
                                                            <Dock fill="#00695C" fillOpacity={.1} className="w-5 h-5 text-[#00695C]" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-[#00695C]">
                                                        <span>Download MTR Complementar</span>
                                                    </TooltipContent>
                                                </Tooltip>
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