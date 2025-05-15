import { ChartColumnBig, List, Table } from "lucide-react"
import { Button } from "./ui/button"

interface SwitchBetweenChartAndListProps {
    handleShowChartManifests :()=> void
    handleShowListManifests :()=> void
    handleShowTableManifests :()=> void
    disableChartButton :boolean
    disableListButton :boolean
    disableTableButton? :boolean
}

export default function SwitchBetweenChartAndListAndTable({ handleShowChartManifests, handleShowListManifests, handleShowTableManifests, disableChartButton, disableListButton, disableTableButton } :SwitchBetweenChartAndListProps) {
    
    return( 
        <div className="flex gap-2 -mt-4">
            <Button 
                className="flex w-fit h-fit p-2 bg-[#00BCD4] hover:bg-[#00BCD480] shadow-md shadow-gray-500 rounded-xl"
                onClick={()=> {
                    handleShowChartManifests()
                }}  
                disabled={disableChartButton}  
            >
                <ChartColumnBig className="w-4 h-4 text-white"/>
            </Button>

            
            <Button 
                className="flex w-fit h-fit p-2 bg-[#00BCD4] hover:bg-[#00BCD480] shadow-md shadow-gray-500 rounded-xl"
                onClick={()=> {
                    handleShowListManifests()
                }}
                disabled={disableListButton}
            >
                <List className="w-4 h-4 text-white"/>
            </Button>

            <Button 
                className="flex w-fit h-fit p-2 bg-[#00BCD4] hover:bg-[#00BCD480] shadow-md shadow-gray-500 rounded-xl"
                onClick={()=> {
                    handleShowTableManifests()
                }}
                disabled={disableTableButton}
            >
                <Table className="w-4 h-4 text-white"/>
            </Button>
        </div>
    )
}