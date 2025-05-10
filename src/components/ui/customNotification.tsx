import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";

export default function CumstomNotification({ text, model } :{text :string, model :string}) {

    const [ isVisible, setIsVisible ] = useState(false)

    useEffect(()=> {
        setIsVisible(true)

        const timeoutId = setTimeout(() => {
            setIsVisible(false)
        }, 4000);

        return () => clearTimeout(timeoutId)
    }, [])

    if(model === 'teste') {
        return(
            <div className={`fixed top-0 ml-[-80px] bg-gray-100 flex h-4 w-full`}>
               <div className="flex flex-col px-2 bg-slate-400">

               </div>
            </div>
        )
    }

    return(
        <div className={`fixed top-0 z-50 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-[-100%]'} flex flex-col pt-10 bg-[#1A1A1E]`}>
            <div className={`flex flex-col items-center justify-between w-[100%] h-fit px-6 py-4 gap-2 justify-self-center rounded-t-md bg-[#29292E]`}>
                <div className="flex justify-between gap-2">
                    <CircleAlert className="text-red-400"/>
                    <span className="text-gray-300 text-sm leading-relaxed select-none">{text}</span>
                </div>
            </div>
            <div className="h-[3px] w-full items-center justify-center bg-[#121214] border-b-2 border-[#29292E]">
                <div className={`h-[2px] w-full bg-red-600 transition-all duration-4000 ease-linear origin-left ${isVisible ? 'scale-x-100' : 'scale-x-0'}`} />
            </div>
        </div>
    )
}