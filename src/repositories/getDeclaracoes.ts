import api from "@/services/api"

export async function getDeclaracoes(operatingUnit :number) {

    if(!operatingUnit) { throw new Error("Código da unidade inválido") }
    
    const { data } = await api.get(`/api/mtr/declaracao/${operatingUnit}`)

    if(data.erro) { throw new Error(data.mensagem?.toString() || "Ocorreu um erro durante a busca.") }

    return data
}