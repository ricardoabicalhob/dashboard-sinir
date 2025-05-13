import { Card } from "./ui/card";

interface ScoreboardProps {
    firstText :string
    secondText :string
    thirdText :string
    fourthText? :string
    firstSubtext :string
    secondSubtext :string
    thirdSubtext :string
    fourthSubtext? :string
    firstPeriodText? :string
    secondPeriodText? :string
    thirdPeriodText? :string
    fourthPeriodText? :string
    firstTotal :number
    secondTotal :number
    thirdTotal :number
    fourthTotal? :number
}

export default function Scoreboard({ 
    firstTotal, 
    secondTotal, 
    thirdTotal, 
    firstText, 
    secondText, 
    thirdText, 
    firstSubtext, 
    secondSubtext, 
    thirdSubtext, 
    firstPeriodText,
    secondPeriodText,
    thirdPeriodText,
    fourthTotal, 
    fourthText, 
    fourthSubtext,
    fourthPeriodText } :ScoreboardProps) {
    return(
        <Card className="p-6">
            <div className={`grid ${fourthTotal? "grid-cols-4" : "grid-cols-3"} gap-2 divide-x`}>
                <div className="flex flex-col items-center gap-2">
                    <p className="font-normal">{firstText}</p>
                    <p className="text-xs font-light">{firstPeriodText}</p>
                    <p className="text-3xl font-semibold text-[#00BCD4]">{firstTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs font-light">{firstSubtext}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="font-normal">{secondText}</p>
                    <p className="text-xs font-light">{secondPeriodText}</p>
                    <p className="text-3xl font-semibold text-[#00BCD4]">{secondTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs font-light">{secondSubtext}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="font-normal">{thirdText}</p>
                    <p className="text-xs font-light">{thirdPeriodText}</p>
                    <p className="text-3xl font-semibold text-[#00BCD4]">{thirdTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs font-light">{thirdSubtext}</p>
                </div>
                {
                    fourthTotal && fourthText && fourthSubtext &&
                        <div className="flex flex-col items-center gap-2">
                            <p className="font-normal">{fourthText}</p>
                            <p className="text-xs font-light">{fourthPeriodText}</p>
                            <p className="text-3xl font-semibold text-[#00BCD4]">{fourthTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="text-xs font-light">{fourthSubtext}</p>
                        </div>
                }
            </div>
        </Card>
    )
}