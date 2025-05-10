import { ChartColumnBig, List } from "lucide-react"

interface SwitchBetweenChartAndListProps {
    handleShowChartManifests :()=> void
    handleShowListManifests :()=> void
}

export default function SwitchBetweenChartAndList({ handleShowChartManifests, handleShowListManifests } :SwitchBetweenChartAndListProps) {
    return(
        <div className="flex gap-2 -mt-4">
                <div 
                    className="flex w-fit h-fit p-2 bg-[#00BCD4] shadow-md shadow-gray-500 rounded-xl cursor-pointer"
                    onClick={()=> handleShowChartManifests()}    
                >
                    <ChartColumnBig className="w-4 h-4 text-white"/>
                </div>

                <div 
                    className="flex w-fit h-fit p-2 bg-[#00BCD4] shadow-md shadow-gray-500 rounded-xl cursor-pointer"
                    onClick={()=> handleShowListManifests()}
                >
                    <List className="w-4 h-4 text-white"/>
                </div>
            </div>
    )
}