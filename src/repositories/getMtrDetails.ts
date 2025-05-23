import { MTRLocalResponseI, MTRResponseI } from "@/interfaces/mtr.interface"
import api from "@/services/api"

export async function getMtrDetails(mtrsList :MTRResponseI[], authorization :string) {
    if(!mtrsList?.length) {
        return []
      }
      const detailsPromises = mtrsList.map(async mtr => {
        const { data } :MTRLocalResponseI = await api.get(`/apiws/rest/retornaManifesto/${mtr.manNumero}`, {
          headers: {
            Authorization: `Bearer ${authorization}`
          }
        })
        // console.log("mtr: ", mtr)
        // console.log("mtr: ", {...data.objetoResposta, manHashCode: mtr.manHashCode})
        return {...data.objetoResposta, manHashCode: mtr.manHashCode, temMtrComplementar: mtr.temMtrComplementar, manCodigoMtrComplementar: mtr.manCodigoMtrComplementar}
      })
      const mtrDetails = await Promise.all(detailsPromises)
      
      return mtrDetails
}