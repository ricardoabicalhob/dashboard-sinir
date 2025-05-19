import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { MTRResponseI } from "@/interfaces/mtr.interface";

export default function generatePdfDownload(titulo :string, listMtrs :MTRResponseI[]) {
    
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    doc.setFontSize(16)
    const titleWidth = doc.getTextWidth(titulo)
    const titleX = (pageWidth - titleWidth) / 2

    const colunas = ["Número MTR", "Data Emissão", "Gerador", "Destinador", "Quantidade"]
    const linhas = listMtrs.map(mtr => [
        mtr.manNumero,
        new Date(mtr.manData).toLocaleDateString("pt-BR"),
        mtr.parceiroGerador.parDescricao,
        mtr.parceiroDestinador.parDescricao,
        mtr.listaManifestoResiduo[0].marQuantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    ])

    doc.text(titulo, titleX, 10)
    autoTable(doc, {
        headStyles: {
            fillColor: "#00695C"
        },
        head: [colunas],
        body: linhas,
        startY: 20
    })
    doc.save("lista-mtrs.pdf")
}