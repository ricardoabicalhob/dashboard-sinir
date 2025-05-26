import { ParceiroResponseCompleteI, ParceiroResponseI } from "@/interfaces/login.interface"
import api from "@/services/api"

export async function consultaParceiro(cnpj :string) {
    if(!cnpj) {
        throw new Error("CNPJ inválido")
      }
      const response = await api.get(`/api/mtr/consultaParceiro/J/${cnpj}`)
      if(!response) {
        throw new Error("Erro ao consutar lista de parceiros")
      }
      
      return response.data.objetoResposta as ParceiroResponseI[]
}