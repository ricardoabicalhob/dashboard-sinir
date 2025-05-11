export async function downloadMtr(numeroMTR :string, authorization :string) {
    try {
        const response = await fetch(`https://admin.sinir.gov.br/apiws/rest/downloadManifesto/${numeroMTR}`, {
            method: 'POST', 
            headers: {
                "Authorization": `Bearer ${authorization}`,
            },
        })


        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Erro na requisição: ${response.status} - ${errorText}`)
            throw new Error(`Erro ao baixar o MTR: ${response.status} - ${errorText}`)
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `manifesto-${numeroMTR}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

    } catch (error) {
        console.error("Erro ao baixar o MTR:", error);
        throw error;
    }
}