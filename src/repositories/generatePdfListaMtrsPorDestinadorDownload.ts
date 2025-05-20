import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { MTRResponseI } from "@/interfaces/mtr.interface";

export default function generatePdfListaMtrsPorDestinadorDownload(titulo :string, periodo :string, listMtrs :MTRResponseI[][]) {
    
    const doc = new jsPDF('landscape', 'pt', 'a4')
    let startY = 25
    const pageWidth = doc.internal.pageSize.getWidth()
    doc.setFontSize(16)
    const mainTitleWidth = doc.getTextWidth(titulo)
    const mainTitleX = (pageWidth - mainTitleWidth) / 2
    doc.text(titulo, mainTitleX, startY)
    startY += 25

    listMtrs.forEach((destinador, index) => {
        if(destinador.length > 0) {
            if(index > 0) {
                doc.addPage()
                startY = 25
            }

            const primeiroMtr = destinador[0]
            const destinadorNome = `${primeiroMtr.parceiroDestinador.parCodigo} - ${primeiroMtr.parceiroDestinador.parDescricao}`

            doc.setFontSize(12)
            const destinadorTitleWidth = doc.getTextWidth(`Destinador: ${destinadorNome}     (${destinador.length} manifestos)`)
            const destinadorTitleX = (pageWidth - destinadorTitleWidth) / 2
            doc.text(`Destinador: ${destinadorNome}     (${destinador.length} manifestos)`, destinadorTitleX, startY + 5)
            startY += 20

            doc.setFontSize(12)
            const periodoTitleWidth = doc.getTextWidth(`Período: ${periodo}`)
            const periodoTitleX = (pageWidth - periodoTitleWidth) / 2
            doc.text(`Período: ${periodo}`, periodoTitleX, startY + 5)
            startY += 15

            const colunas = ["Número MTR", "Data Emissão", "Gerador", "Data Recebimento", "Quantidade Indicada no MTR", "Quantidade Recebida"]
            const linhas = destinador.map(mtr => [
                mtr.manNumero,
                new Date(mtr.manData).toLocaleDateString("pt-BR"),
                mtr.parceiroGerador.parDescricao,
                mtr.situacaoManifesto.simDataRecebimento,
                mtr.listaManifestoResiduo[0].marQuantidade.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                mtr.listaManifestoResiduo[0].marQuantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            ])

            autoTable(doc, {
                headStyles: {
                  fillColor: "#00695C",
                },
                head: [colunas],
                body: linhas,
                startY: startY,
            })

            // startY = (doc as any).lastAutoTable.finalY + 10
        }
    })

    doc.save("lista-mtrs-por-destinador.pdf");
}