import { ChartColumnBig, List } from "lucide-react"
import { Button } from "./button"

interface SwitchBetweenChartAndListProps {
    handleShowChartManifests :()=> void
    handleShowListManifests :()=> void
    disableChartButton :boolean
    disableListButton :boolean
}

export default function SwitchBetweenChartAndList({ handleShowChartManifests, handleShowListManifests, disableChartButton, disableListButton } :SwitchBetweenChartAndListProps) {
    
    return(
        <div className="flex gap-2 -mt-4">
            <Button 
                className="flex w-fit h-fit p-2 bg-[#00BCD4] hover:bg-[#00BCD480] shadow-md shadow-gray-500 rounded-xl cursor-pointer"
                onClick={()=> {
                    handleShowChartManifests()
                }}  
                disabled={disableChartButton}  
            >
                <ChartColumnBig className="w-4 h-4 text-white"/>
            </Button>

            
            <Button 
                className="flex w-fit h-fit p-2 bg-[#00BCD4] hover:bg-[#00BCD480] shadow-md shadow-gray-500 rounded-xl cursor-pointer"
                onClick={()=> {
                    handleShowListManifests()
                }}
                disabled={disableListButton}
            >
                <List className="w-4 h-4 text-white"/>
            </Button>
        </div>
    )
}