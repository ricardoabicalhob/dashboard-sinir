import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { MTRResponseI } from "@/interfaces/mtr.interface";

type FilterColumns = "Número MTR" | "Data Emissão" | "Gerador" | "Destinador" | "Armazenador Temporário" | "Data Recebimento AT" | "Transportador" | "Resíduo" | "Quantidade Indicada no MTR" | "Quantidade Recebida" | "Data Recebimento" | "Situação"

export default function generatePdfListaMtrsDownload(unidade :string, title :string, period :string, listMtrs :MTRResponseI[], filterColumns :FilterColumns[]) {
    
    const doc = new jsPDF('landscape', 'pt', 'a4')
    let startY = 25
    const pageWidth = doc.internal.pageSize.getWidth()
    
    doc.setFontSize(16)

    const unidadeTitleWidth = doc.getTextWidth(unidade)
    const unidadeTitleX = (pageWidth - unidadeTitleWidth) / 2
    doc.text(unidade, unidadeTitleX, startY)
    startY += 25

    doc.setFontSize(14)

    const mainTitleWidth = doc.getTextWidth(`${title} (${listMtrs.length} manifestos)`)
    const mainTitleX = (pageWidth - mainTitleWidth) / 2
    doc.text(`${title} (${listMtrs.length} manifestos)`, mainTitleX, startY)
    startY += 25

    // const primeiroMtr = listMtrs[0]

    // if(typeList === "Gerador") {
    //     const geradorNome = `${primeiroMtr.parceiroGerador.parCodigo} - ${primeiroMtr.parceiroGerador.parDescricao}`
    //     doc.setFontSize(12)
    //     const geradorTitleWidth = doc.getTextWidth(`Gerador: ${geradorNome}     (${listMtrs.length} manifestos)`)
    //     const geradorTitleX = (pageWidth - geradorTitleWidth) / 2
    //     doc.text(`Gerador: ${geradorNome}     (${listMtrs.length} manifestos)`, geradorTitleX, startY + 5)
    //     startY += 20
    // }

    // if(typeList === "Destinador") {
    //     const destinadorNome = `${primeiroMtr.parceiroDestinador.parCodigo} - ${primeiroMtr.parceiroDestinador.parDescricao}`
    //     doc.setFontSize(12)
    //     const destinadorTitleWidth = doc.getTextWidth(`Destinador: ${destinadorNome}     (${listMtrs.length} manifestos)`)
    //     const destinadorTitleX = (pageWidth - destinadorTitleWidth) / 2
    //     doc.text(`Destinador: ${destinadorNome}     (${listMtrs.length} manifestos)`, destinadorTitleX, startY + 5)
    //     startY += 20
    // }

    // if(typeList === "Armazenador Temporário") {
    //     const armazenadorNome = `${primeiroMtr.parceiroArmazenadorTemporario.parCodigo} - ${primeiroMtr.parceiroArmazenadorTemporario.parDescricao}`
    //     doc.setFontSize(12)
    //     const armazenadorTitleWidth = doc.getTextWidth(`Armazenador Temporário: ${armazenadorNome}     (${listMtrs.length} manifestos)`)
    //     const armazenadorTitleX = (pageWidth - armazenadorTitleWidth) / 2
    //     doc.text(`Armazenador Temporário: ${armazenadorNome}     (${listMtrs.length} manifestos)`, armazenadorTitleX, startY + 5)
    //     startY += 20
    // }

    doc.setFontSize(12)
    const periodoTitleWidth = doc.getTextWidth(`Período: ${period}`)
    const periodoTitleX = (pageWidth - periodoTitleWidth) / 2
    doc.text(`Período: ${period}`, periodoTitleX, startY + 5)
    startY += 15

    const colunas :string[] = []
    if(filterColumns.includes("Número MTR")) colunas.push("Número MTR")
    if(filterColumns.includes("Data Emissão")) colunas.push("Data Emissão")
    if(filterColumns.includes("Gerador")) colunas.push("Gerador")
    if(filterColumns.includes("Destinador")) colunas.push("Destinador")
    if(filterColumns.includes("Armazenador Temporário")) colunas.push("Armazenador Temporário")
    if(filterColumns.includes("Data Recebimento AT")) colunas.push("Data Recebimento AT")
    if(filterColumns.includes("Transportador")) colunas.push("Transportador")
    if(filterColumns.includes("Resíduo")) colunas.push("Resíduo")
    if(filterColumns.includes("Quantidade Indicada no MTR")) colunas.push("Quantidade Indicada no MTR")
    if(filterColumns.includes("Quantidade Recebida")) colunas.push("Quantidade Recebida")
    if(filterColumns.includes("Data Recebimento")) colunas.push("Data Recebimento")
    if(filterColumns.includes("Situação")) colunas.push("Situação")

    const linhas = listMtrs.map(mtr => {
        const linha :(string | number)[]= []
        if(filterColumns.includes("Número MTR")) linha.push(mtr.manNumero)
        if(filterColumns.includes("Data Emissão")) linha.push(new Date(mtr.manData).toLocaleDateString("pt-BR"))
        if(filterColumns.includes("Gerador")) linha.push(`${mtr.parceiroGerador.parCodigo} - ${mtr.parceiroGerador.parDescricao}`)
        if(filterColumns.includes("Destinador")) linha.push(`${mtr.parceiroDestinador.parCodigo} - ${mtr.parceiroDestinador.parDescricao}`)
        if(filterColumns.includes("Armazenador Temporário")) linha.push(mtr.possuiArmazenamentoTemporario ? `${mtr.parceiroArmazenadorTemporario.parCodigo} - ${mtr.parceiroArmazenadorTemporario.parDescricao}` : "Não possui")
        if(filterColumns.includes("Data Recebimento AT")) linha.push(mtr.dataRecebimentoAT || '-')
        if(filterColumns.includes("Transportador")) linha.push(`${mtr.parceiroTransportador.parCodigo} - ${mtr.parceiroTransportador.parDescricao}`)
        if(filterColumns.includes("Resíduo")) linha.push(`${mtr.listaManifestoResiduo[0].residuo.resCodigoIbama} - ${mtr.listaManifestoResiduo[0].residuo.resDescricao}`)
        if(filterColumns.includes("Quantidade Indicada no MTR")) linha.push(mtr.listaManifestoResiduo[0].marQuantidade.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        if(filterColumns.includes("Quantidade Recebida")) linha.push(mtr.listaManifestoResiduo[0].marQuantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        if(filterColumns.includes("Data Recebimento")) linha.push(mtr.situacaoManifesto.simDataRecebimento)
        if(filterColumns.includes("Situação")) linha.push(mtr.situacaoManifesto.simDescricao)
        return linha
    })

    autoTable(doc, {
        headStyles: {
        fillColor: "#00695C",
        },
        head: [colunas],
        body: linhas,
        startY: startY,
    })

    doc.save(`${unidade} - ${title}.pdf`);
}