import { Printer } from "lucide-react";
import { Card, CardHeader, CardTitle } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { downloadMtr } from "@/repositories/downloadMtr";
import { MTRResponseI } from "@/interfaces/mtr.interface";

interface ListaDeMtrsProps {
    listMtrs :MTRResponseI[]
    title :string
    authorization :string
}

export default function ListaDeMtrs({ listMtrs, title, authorization } :ListaDeMtrsProps) {

    const handleDownloadMtr = async (numeroMtr :string, authorization :string) => {
        await downloadMtr(numeroMtr, authorization)
    }

    return(
        <Card>
            <CardHeader>
                <CardTitle className="text-xl text-black/50 text-center font-semibold">{title}</CardTitle>
            </CardHeader>
            <div className="flex h-[500px] p-2 rounded-md shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>MTR Nº</TableHead>
                            <TableHead>Data Emissão</TableHead>
                            <TableHead>Gerador</TableHead>
                            <TableHead>Destinador</TableHead>
                            <TableHead>Data Recebimento</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            listMtrs.map(mtr => (
                                <TableRow>
                                    <TableCell><span>{mtr.manNumero}</span></TableCell>
                                    <TableCell>{new Date(mtr.manData).toLocaleDateString()}</TableCell>
                                    <TableCell>{mtr.parceiroGerador.parDescricao}</TableCell>
                                    <TableCell>{mtr.parceiroDestinador.parDescricao}</TableCell>
                                    <TableCell>{mtr.situacaoManifesto.simDataRecebimento}</TableCell>
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