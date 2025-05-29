import { MTRResponseI } from "@/interfaces/mtr.interface";
import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import { agruparPorTipoDeResiduo } from "@/utils/fnFilters";
import { totalizarQuantidadeIndicadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils";
import { Fragment, useEffect, useRef } from "react";

interface TabelaDemonstrativaSimplesProps {
    listaAgrupadaPorDestinadorEGerador :MTRResponseI[][][]
    title :string
}

export default function TabelaDemonstrativaCompleta({ listaAgrupadaPorDestinadorEGerador: listaAgrupadaPorDestinadorOuGerador, title } :TabelaDemonstrativaSimplesProps) {
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

    useEffect(()=> {
        console.log(listaAgrupadaPorDestinadorOuGerador)
    }, [])

    return(
        <Card ref={cardTableRef} className="opacity-0 transition-opacity duration-700">
            <div className="flex flex-col h-[450px] p-2 rounded-md shadow-sm overflow-y-auto">
                <p className="text-gray-500 text-xl text-center font-semibold">{title}</p>
                {
                    listaAgrupadaPorDestinadorOuGerador.map(destinador => (
                        <div key={`DESTINADOR-${destinador[0][0].parceiroDestinador.parCodigo}`} className="w-full">
                            
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-normal font-semibold" colSpan={1}>
                                            <p className="text-gray-500 py-2">Destinador</p>
                                            <p>{`${destinador[0][0].parceiroDestinador.parCodigo} - ${destinador[0][0].parceiroDestinador.parDescricao.toUpperCase()}`}</p>
                                        </TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead className="pl-6">
                                            Gerador
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {destinador.map(manifestosGerador => (
                                        <Fragment key={`GERADOR-DETAILS-${manifestosGerador[0].parceiroGerador.parCodigo}`}>
                                            <TableRow>
                                                <TableCell className="font-semibold pl-6">{`${manifestosGerador[0].parceiroGerador.parCodigo} - ${manifestosGerador[0].parceiroGerador.parDescricao}`}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={1}>
                                                    <div className="ml-8">
                                                        <Table className="w-full">
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-fit" style={{ width: residuoColumnWidth }}>Tipo de resíduo</TableHead>
                                                                    <TableHead style={{ width: quantidadeColumnWidth }}>Quantidade indicada no MTR</TableHead>
                                                                    <TableHead style={{ width: quantidadeColumnWidth }}>Quantidade recebida</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {agruparPorTipoDeResiduo(manifestosGerador).map(wasteType => (
                                                                    <TableRow key={`DETAILS-${wasteType.resDescricao}`}>
                                                                        <TableCell style={{ width: residuoColumnWidth }}>{wasteType.resDescricao}</TableCell>
                                                                        <TableCell style={{ width: quantidadeColumnWidth }}>{wasteType.quantidadeIndicadaNoMTR.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).concat(" T")}</TableCell>
                                                                        <TableCell style={{ width: quantidadeColumnWidth }}>{wasteType.quantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).concat(" T")}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                            <TableFooter className="bg-gray-100">
                                                                <TableRow>
                                                                    <TableCell style={{ width: residuoColumnWidth }}>Total</TableCell>
                                                                    <TableCell style={{ width: quantidadeColumnWidth }}>{totalizarQuantidadeIndicadaNoManifesto(agruparPorTipoDeResiduo(manifestosGerador)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).concat(" T")}</TableCell>
                                                                    <TableCell style={{ width: quantidadeColumnWidth }}>{totalizarQuantidadeRecebida(agruparPorTipoDeResiduo(manifestosGerador)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).concat(" T")}</TableCell>
                                                                </TableRow>
                                                            </TableFooter>
                                                        </Table>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))
                }
            </div>
        </Card>
    );
}