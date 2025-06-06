import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormField, FormItem } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { subtrairDatasEmDias } from "@/utils/fnUtils"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import { useForm } from "react-hook-form"
import { z } from "zod"

const periodoSchema = z.object({
    dateRange: z.object({
      from: z.date(),
      to: z.date().optional()
    }).optional()
  })

type periodoSchema = z.infer<typeof periodoSchema>  

interface DateRangePickerProps {
    dateRange :DateRange
    setDateRange :Dispatch<SetStateAction<DateRange>>
}

export default function DateRangePicker({ dateRange, setDateRange } :DateRangePickerProps) {
    const [ open, setOpen ] = useState(false)
    const [ defaultStartDate, setDefaultStartDate ] = useState<DateRange | undefined>({
        from: dateRange.from,
        to: dateRange.to
    })

    const { toast } = useToast()

    const handleErrorMessage = (description :string)=> {
        toast({
          variant: "destructive",  
          duration: 4000,
          description: <div className="flex items-start gap-2">
                         <span className="font-semibold">{description}</span>
                       </div>
        })
      }

    useEffect(()=> {
        if(dateRange) {
            setDefaultStartDate(dateRange)
        } else {
            setDateRange(defaultStartDate || {from: new Date(), to: new Date()})
        }
    }, [dateRange, setDateRange])
    
    const form = useForm<periodoSchema>({
        resolver: zodResolver(periodoSchema),
        defaultValues: {
        dateRange: {
            from: defaultStartDate?.from,
            to: defaultStartDate?.to
        }
        }
    })

    function onSubmit(data :periodoSchema) {
        if(data.dateRange && data.dateRange.to && data.dateRange?.from) {
            if(subtrairDatasEmDias(data.dateRange?.from, data.dateRange?.to) > 90) {
                handleErrorMessage("O intervalo entre as datas não pode ser maior do que 90 dias")
                if(dateRange && dateRange.from && dateRange.to) {
                    form.setValue("dateRange.from", dateRange.from)
                    form.setValue("dateRange.to", dateRange.to)
                }
                throw new Error("O intervalo entre as datas não pode ser maior do que 90 dias")
            } 
            setDateRange(data.dateRange)
        }
    }

    return(
        <Form {...form}>
            <form id="formPeriodo" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pr-2">
                <FormField 
                control={form.control}
                name="dateRange"
                render={({ field })=> (
                    <FormItem className="flex flex-col">
                    <Popover open={open}>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !field.value?.from && "text-muted-foreground"
                            )}
                            onClick={()=> setOpen(!open)}
                        >
                            <CalendarIcon />
                            {field.value?.from ? (
                            field.value.to ? (
                                <>
                                {format(field.value.from, "LLL dd, y", { locale: ptBR })} -{" "}
                                {format(field.value.to, "LLL dd, y", { locale: ptBR })}
                                </>
                            ) : (
                                format(field.value.from, "LLL dd, y", { locale: ptBR })
                            )
                            ) : (
                            <span>Pick a date</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            toDate={new Date(Date.now())}
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={3}
                            locale={ptBR}
                        />
                        <div className="flex w-full justify-end px-4 py-3 bg-gray-100">
                            <Button form="formPeriodo" type="submit" onClick={()=> setOpen(!open)} className="bg-[#00695C] hover:bg-[#00695C95]">Pesquisar</Button>
                        </div>
                        </PopoverContent>
                    </Popover>
                    </FormItem>
                )}
                />
            </form>
        </Form>
    )
}