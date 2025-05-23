import { MTRResponseI } from "@/interfaces/mtr.interface";
import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import { agruparPorTipoDeResiduo } from "@/utils/fnFilters";
import { totalizarQuantidadeIndicadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils";
import { Fragment, useEffect, useRef } from "react";

interface TabelaDemonstrativaSimplesProps {
    listaAgrupadaPorDestinadorOuGerador :MTRResponseI[][]
    title :string
    tipo :"Destinador" | "Gerador"
}

export default function TabelaDemonstrativaSimples({ listaAgrupadaPorDestinadorOuGerador, title, tipo } :TabelaDemonstrativaSimplesProps) {
    const cardTableRef = useRef<HTMLDivElement>(null);
    const residuoColumnWidth = '400px'
    const quantidadeColumnWidth = '50px'

    useEffect(()=> {
        setTimeout(() => {
            if(cardTableRef.current) {
                cardTableRef.current.classList.remove("opacity-0");
                cardTableRef.current.classList.add("opacity-100");
            }
        }, 100);
    }, []);

    return(
        <Card ref={cardTableRef} className="opacity-0 transition-opacity duration-700">
            <div className="flex h-[450px] p-2 rounded-md shadow-sm overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xl text-center font-semibold" colSpan={1}>
                                {title}
                            </TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead>
                                {tipo === "Destinador" && "Destinador"}
                                {tipo === "Gerador" && "Gerador"}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    {
                        tipo === "Destinador" &&
                            <TableBody>
                                {listaAgrupadaPorDestinadorOuGerador.map(destinador => (
                                    <Fragment key={`DESTINADOR-DETAILS-${destinador[0].parceiroDestinador.parCodigo}`}>
                                        <TableRow>
                                            <TableCell className="font-semibold">{`${destinador[0].parceiroDestinador.parCodigo} - ${destinador[0].parceiroDestinador.parDescricao}`}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={1}>
                                                <div className="ml-8">
                                                    <Table className="w-full"> {/* Garante que a tabela interna ocupe a largura da célula */}
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-fit" style={{ width: residuoColumnWidth }}>Tipo de resíduo</TableHead>
                                                                <TableHead style={{ width: quantidadeColumnWidth }}>Quantidade indicada no MTR</TableHead>
                                                                <TableHead style={{ width: quantidadeColumnWidth }}>Quantidade recebida</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {agruparPorTipoDeResiduo(destinador).map(wasteType => (
                                                                <TableRow key={`DETAILS-${wasteType.resDescricao}`}>
                                                                    <TableCell style={{ width: residuoColumnWidth }}>{wasteType.resDescricao}</TableCell>
                                                                    <TableCell style={{ width: quantidadeColumnWidth }}>{wasteType.quantidadeIndicadaNoMTR.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                    <TableCell style={{ width: quantidadeColumnWidth }}>{wasteType.quantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                        <TableFooter className="bg-gray-100">
                                                            <TableRow>
                                                                <TableCell style={{ width: residuoColumnWidth }}>Total</TableCell>
                                                                <TableCell style={{ width: quantidadeColumnWidth }}>{totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(destinador)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                <TableCell style={{ width: quantidadeColumnWidth }}>{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(destinador)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                            </TableRow>
                                                        </TableFooter>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                ))}
                            </TableBody>
                    }

                    {
                        tipo === "Gerador" &&
                            <TableBody>
                                {listaAgrupadaPorDestinadorOuGerador.map(gerador => (
                                    <Fragment key={`GERADOR-DETAILS-${gerador[0].parceiroGerador.parCodigo}`}>
                                        <TableRow>
                                            <TableCell className="font-semibold">{`${gerador[0].parceiroGerador.parCodigo} - ${gerador[0].parceiroGerador.parDescricao}`}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={1}>
                                                <div className="ml-8">
                                                    <Table className="w-full"> {/* Garante que a tabela interna ocupe a largura da célula */}
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-fit" style={{ width: residuoColumnWidth }}>Tipo de resíduo</TableHead>
                                                                <TableHead style={{ width: quantidadeColumnWidth }}>Quantidade indicada no MTR</TableHead>
                                                                <TableHead style={{ width: quantidadeColumnWidth }}>Quantidade recebida</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {agruparPorTipoDeResiduo(gerador).map(wasteType => (
                                                                <TableRow key={`DETAILS-${wasteType.resDescricao}`}>
                                                                    <TableCell style={{ width: residuoColumnWidth }}>{wasteType.resDescricao}</TableCell>
                                                                    <TableCell style={{ width: quantidadeColumnWidth }}>{wasteType.quantidadeIndicadaNoMTR.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                    <TableCell style={{ width: quantidadeColumnWidth }}>{wasteType.quantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                        <TableFooter className="bg-gray-100">
                                                            <TableRow>
                                                                <TableCell style={{ width: residuoColumnWidth }}>Total</TableCell>
                                                                <TableCell style={{ width: quantidadeColumnWidth }}>{totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(gerador)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                                <TableCell style={{ width: quantidadeColumnWidth }}>{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(gerador)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                                            </TableRow>
                                                        </TableFooter>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                ))}
                            </TableBody>
                    }
                </Table>
            </div>
        </Card>
    );
}