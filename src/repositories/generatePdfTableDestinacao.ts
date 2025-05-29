import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { MTRResponseI } from "@/interfaces/mtr.interface";
import { agruparPorTipoDeResiduo } from "@/utils/fnFilters";
import { totalizarQuantidadeIndicadaNoManifesto, totalizarQuantidadeRecebida } from "@/utils/fnUtils";

interface DestinadorDataForPdf {
    nomePrincipal: string; 
    tipo: "Destinador" | "Gerador";
    residuosDetalhe: Array<{
        resDescricao: string;
        quantidadeIndicadaNoMTR: number;
        quantidadeRecebida: number;
    }>;
    totalIndicado: number;
    totalRecebido: number;
}

export function prepareDataForPdf(
    listaAgrupadaPorDestinadorOuGerador: MTRResponseI[][],
    tipo: "Destinador" | "Gerador"
): DestinadorDataForPdf[] {
    return listaAgrupadaPorDestinadorOuGerador.map(grupo => {
        const principal = tipo === "Destinador" ? grupo[0].parceiroDestinador : grupo[0].parceiroGerador;
        const nomePrincipal = `${principal.parCodigo} - ${principal.parDescricao}`;

        const residuosAgrupados = agruparPorTipoDeResiduo(grupo);

        const residuosDetalhe = residuosAgrupados.map(res => ({
            resDescricao: res.resDescricao,
            quantidadeIndicadaNoMTR: res.quantidadeIndicadaNoMTR,
            quantidadeRecebida: res.quantidadeRecebida
        }));

        const totalIndicado = totalizarQuantidadeIndicadaNoManifesto(residuosAgrupados);
        const totalRecebido = totalizarQuantidadeRecebida(residuosAgrupados);

        return {
            nomePrincipal,
            tipo,
            residuosDetalhe,
            totalIndicado,
            totalRecebido
        }
    });
}

export function generatePdfTableDestinacao(data: DestinadorDataForPdf[], title :string, subtitle: string, periodo :string, tipo: "Destinador" | "Gerador"): void {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.setFont("", "", "bold")
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    doc.setFont("", "", "normal")
    doc.setFontSize(14);
    doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    doc.setFontSize(10);
    doc.text(`Gerado em: ${formattedDate}`, doc.internal.pageSize.getWidth() - 10, 40, { align: 'right' });

    doc.setFontSize(12)
    doc.text(`Período: ${periodo}`, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });


    let yOffset = 55; 

    data.forEach((item, index) => {
        if (index > 0) {
            const estimatedHeight = 10 + (item.residuosDetalhe.length * 7) + 20; 
            if (yOffset + estimatedHeight > doc.internal.pageSize.getHeight() - 30) { 
                doc.addPage();
                yOffset = 20; 
            }
        }

        doc.setFontSize(12);
        doc.text(`${tipo}: ${item.nomePrincipal}`, 14, yOffset);
        yOffset += 2;

        autoTable(doc, {
            startY: yOffset,
            head: [['Tipo de Resíduo', 'Quantidade Indicada no MTR', 'Quantidade Recebida']],
            body: item.residuosDetalhe.map(res => [
                res.resDescricao,
                res.quantidadeIndicadaNoMTR.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).concat(" T"),
                res.quantidadeRecebida.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).concat(" T")
            ]),
            theme: 'striped',
            styles: {
                fontSize: 9,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [0, 105, 92],
                textColor: 255,
                halign: 'center'
            },
            bodyStyles: {
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'left', cellWidth: 120 },
                1: { halign: 'right', cellWidth: 70 },
                2: { halign: 'right', cellWidth: 70 }
            },
            willDrawCell: (data) => {
                // Se a célula é do cabeçalho da tabela interna, podemos mudar o estilo
                if (data.section === 'head' && data.row.index === 0) {
                    // Por exemplo, tornar o texto mais forte ou mudar a cor
                    // data.cell.styles.fontStyle = 'bold';
                    // data.cell.styles.textColor = [0, 0, 0]; // Preto
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yOffset = (doc as any).lastAutoTable.finalY + 5;

        doc.setFontSize(10);
        doc.text(`Total`, 14 + 80, yOffset, { align: 'right' }); 
        doc.text(`${item.totalIndicado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).concat(" T")}`, 14 + 119 + 69, yOffset, { align: 'right' });
        doc.text(`${item.totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).concat(" T")}`, 14 + 119 + 69 + 70, yOffset, { align: 'right' });

        yOffset += 15;
    });

    doc.save(`${subtitle.replace(/[^a-zA-Z0-9]/g, '_')}_Relatorio_${periodo.replace(/[: ]/g, '-')}.pdf`);
}