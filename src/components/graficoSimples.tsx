import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { GroupByWasteTypeOutput } from "@/utils/fnFilters";

interface GraficoProps {
    title :string
    subTitle? :string
    acumulated? :number
    dataChart? :GroupByWasteTypeOutput[]
}

export default function GraficoSimples({ dataChart, title, subTitle, acumulated } :GraficoProps) {

    const chartConfig = {
      desktop: {
        label: "Desktop",
        color: "#00695C",
      }
    } satisfies ChartConfig

    return(
      <Card className="w-full md:w-[100%] max-w-full justify-self-center">
        <CardHeader>
          <div className="flex flex-col gap-2 items-center justify-center">
            <CardTitle className="text-lg text-center sm:text-xl text-gray-800">
                {title}
            </CardTitle>
            {
              subTitle &&
                <CardTitle className="font-light">{subTitle}</CardTitle>
            }
            <CardTitle>{`Total acumulado: ${acumulated?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
              
              <BarChart data={dataChart}>
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
                      dataKey="quantidadeEstimada"
                      fill="var(--color-desktop)"
                      radius={[4, 4, 0, 0]}
                      barSize={100}
                  />
              </BarChart>

          </ChartContainer>
        </CardContent>
      </Card>
    )
  }