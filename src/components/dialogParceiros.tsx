import { ParceiroResponseI } from "@/interfaces/login.interface"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { filtrarArray } from "@/utils/fnFilters"
import { Check, Search } from "lucide-react"
import { UseFormSetValue } from "react-hook-form"
import { useEffect, useState } from "react"

interface DialogParceirosProps {
    listaDeParceiros :ParceiroResponseI[]
    setUnidadeSelecionada :UseFormSetValue<{
        login: string;
        senha: string;
        parCodigo: string;
    }>
}

export default function DialogParceiros({ listaDeParceiros, setUnidadeSelecionada } :DialogParceirosProps) {
    
    const [ listaFiltrada, setListaFiltrada ] = useState<ParceiroResponseI[]>(listaDeParceiros)
    const [ valorDigitado, setValorDigitado ] = useState<string>("")
    
    useEffect(()=> {
        const filtrados = filtrarArray(valorDigitado, listaDeParceiros)
        setListaFiltrada(filtrados)
    }, [valorDigitado, listaDeParceiros])

    return(
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    className="h-12 mt-2 text-[17px] font-sans bg-[#00695C] hover:bg-[#00695C]/80"
                >
                    Unidades <Search />
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-[800px] max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="py-1">Unidades</DialogTitle>
                    <Input 
                        placeholder="Filtar unidades..."
                        value={valorDigitado}
                        onChange={e => setValorDigitado(e.target.value)}
                    />
                </DialogHeader>
                <div className="flex max-h-[50vh] min-h-[50vh]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Selecionar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                listaFiltrada.map(parceiro => (
                                    <TableRow key={parceiro.parCodigo} className="text-black">
                                        <TableCell>{parceiro.parCodigo}</TableCell>
                                        <TableCell>{parceiro.parDescricao}</TableCell>
                                        <TableCell>
                                            <div 
                                                className="flex w-full items-center justify-center cursor-pointer"
                                                onClick={()=> {
                                                    setUnidadeSelecionada("parCodigo", parceiro.parCodigo.toString(), {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                        shouldTouch: true
                                                    })
                                                }}
                                            >
                                                <DialogClose asChild>
                                                    <div className="w-fit p-2 cursor-pointer hover:bg-[#00BCD430] rounded-full">
                                                        <Check className="w-5 h-5 text-[#00695C]"/>
                                                    </div>
                                                </DialogClose>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}