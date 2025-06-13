import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { GroupByWasteTypeOutput } from "@/utils/fnFilters";
import { useEffect, useRef } from "react";

interface GraficoProps {
    title :string
    subTitle? :string
    acumulated? :number
    dataChart? :GroupByWasteTypeOutput[]
}

export default function GraficoBarraDupla({ dataChart, title, subTitle, acumulated } :GraficoProps) {

    const chartRef = useRef<HTMLDivElement>(null)

    const chartConfig = {
    quantidadeIndicadaNoMTR: {
        label: "Quantidade Indicada no MTR",
        color: "#00695C",
    },
    quantidadeRecebida: {
        label: "Quantidade Recebida",
        color: "#00695C80"
    }
    } satisfies ChartConfig

    useEffect(()=> {
        setTimeout(() => {
            if(chartRef.current) {
                chartRef.current.classList.remove("opacity-0")
                chartRef.current.classList.add("opacity-100")
            }
        }, 100)
    }, [])

    return(
    <Card ref={chartRef} className="w-full md:w-[100%] max-w-full justify-self-center opacity-0 transition-opacity duration-1000">
        <CardHeader>
        <div className="flex flex-col gap-2 items-center justify-center">
            <CardTitle className="text-lg text-center sm:text-xl text-gray-800">
                {title}
            </CardTitle>
            {
                subTitle &&
                    <CardTitle className="font-light">{subTitle}</CardTitle>
            }
            <CardTitle>{`Total acumulado: ${acumulated?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} <span className="text-xs">T</span></CardTitle>
        </div>
        </CardHeader>
        <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
            
            <BarChart 
                data={dataChart}
                margin={{
                    top: 20,
                    bottom: 0,
                    left: 0,
                    right: 0
                }}
            >
                <CartesianGrid vertical={false}/>
                <XAxis
                    className="select-none"
                    dataKey="resDescricao"
                    tickLine={false}
                    tickMargin={10}
                    fontSize={12}
                    axisLine={false}
                    tickFormatter={(value)=>value}
                />

                <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value)=>`${value} TON`}
                />

                <ChartTooltip content={<ChartTooltipContent/>}/>
                <ChartLegend content={<ChartLegendContent/>}/>
                <CartesianGrid vertical={false}/>

                <Bar
                    dataKey="quantidadeIndicadaNoMTR"
                    fill="var(--color-quantidadeIndicadaNoMTR)"
                    radius={[4, 4, 0, 0]}
                    barSize={100}
                >
                    <LabelList
                        dataKey="quantidadeIndicadaNoMTR"
                        position="top"
                        formatter={(value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        fill="#000"
                        fontSize={10}
                    />
                </Bar>

                <Bar
                    dataKey="quantidadeRecebida"
                    fill="var(--color-quantidadeRecebida)"
                    radius={[4, 4, 0, 0]}
                    barSize={100}
                >
                    <LabelList
                        dataKey="quantidadeRecebida"
                        position="top"
                        formatter={(value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} // Formato do valor
                        fill="#000"
                        fontSize={10}
                    />
                </Bar>
            </BarChart>

        </ChartContainer>
        </CardContent>
    </Card>
    )
}