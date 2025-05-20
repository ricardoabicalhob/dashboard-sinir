import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { MTRResponseI } from "@/interfaces/mtr.interface";

export default function generatePdfListaMtrsDownload(titulo :string, periodo :string, listMtrs :MTRResponseI[]) {
    
    const doc = new jsPDF('landscape', 'pt', 'a4')
    let startY = 25
    const pageWidth = doc.internal.pageSize.getWidth()
    doc.setFontSize(16)
    const mainTitleWidth = doc.getTextWidth(titulo)
    const mainTitleX = (pageWidth - mainTitleWidth) / 2
    doc.text(titulo, mainTitleX, startY)
    startY += 25

    const primeiroMtr = listMtrs[0]
    const geradorNome = `${primeiroMtr.parceiroGerador.parCodigo} - ${primeiroMtr.parceiroGerador.parDescricao}`

    doc.setFontSize(12)
    const destinadorTitleWidth = doc.getTextWidth(`Gerador: ${geradorNome}     (${listMtrs.length} manifestos)`)
    const destinadorTitleX = (pageWidth - destinadorTitleWidth) / 2
    doc.text(`Gerador: ${geradorNome}     (${listMtrs.length} manifestos)`, destinadorTitleX, startY + 5)
    startY += 20

    doc.setFontSize(12)
    const periodoTitleWidth = doc.getTextWidth(`Período: ${periodo}`)
    const periodoTitleX = (pageWidth - periodoTitleWidth) / 2
    doc.text(`Período: ${periodo}`, periodoTitleX, startY + 5)
    startY += 15

    const colunas = ["Número MTR", "Data Emissão", "Destinador", "Quantidade Indicada no MTR", "Situação"]
    const linhas = listMtrs.map(mtr => [
        mtr.manNumero,
        new Date(mtr.manData).toLocaleDateString("pt-BR"),
        mtr.parceiroDestinador.parDescricao,
        mtr.listaManifestoResiduo[0].marQuantidade.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        mtr.situacaoManifesto.simDescricao
    ])

    autoTable(doc, {
        headStyles: {
        fillColor: "#00695C",
        },
        head: [colunas],
        body: linhas,
        startY: startY,
    })

    doc.save(`${listMtrs[0].parceiroGerador.parCodigo}-lista-mtrs.pdf`);
}