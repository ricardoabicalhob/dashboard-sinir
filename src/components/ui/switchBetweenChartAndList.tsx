import { ChartColumnBig, List } from "lucide-react"
import { useState } from "react"

interface SwitchBetweenChartAndListProps {
    handleShowChartManifests :()=> void
    handleShowListManifests :()=> void
}

export default function SwitchBetweenChartAndList({ handleShowChartManifests, handleShowListManifests } :SwitchBetweenChartAndListProps) {
    
    const [ disableChartButton, setDisableChartButton ] = useState(true)
    const [ disableListButton, setDisableListButton ] = useState(false)

    function handleDisableChartButton() {
        setDisableChartButton(true)
        setDisableListButton(false)
    }

    function handleDisableListButton() {
        setDisableListButton(true)
        setDisableChartButton(false)
    }

    return(
        <div className="flex gap-2 -mt-4">
                {
                    disableChartButton &&
                        <div 
                            className="flex w-fit h-fit p-2 bg-gray-300 shadow-md shadow-gray-500 rounded-xl"    
                        >
                            <ChartColumnBig className="w-4 h-4 text-black/20"/>
                        </div>
                }

                {
                    !disableChartButton &&
                        <div 
                            className="flex w-fit h-fit p-2 bg-[#00BCD4] shadow-md shadow-gray-500 rounded-xl cursor-pointer"
                            onClick={()=> {
                                handleShowChartManifests()
                                handleDisableChartButton()
                            }}    
                        >
                            <ChartColumnBig className="w-4 h-4 text-white"/>
                        </div>
                }

                {
                    disableListButton &&
                        <div 
                            className="flex w-fit h-fit p-2 bg-gray-300 shadow-md shadow-gray-500 rounded-xl"    
                        >
                            <List className="w-4 h-4 text-black/20"/>
                        </div>
                }

                {
                    !disableListButton && 
                        <div 
                            className="flex w-fit h-fit p-2 bg-[#00BCD4] shadow-md shadow-gray-500 rounded-xl cursor-pointer"
                            onClick={()=> {
                                handleShowListManifests()
                                handleDisableListButton()
                            }}
                        >
                            <List className="w-4 h-4 text-white"/>
                        </div>
                }
            </div>
    )
}