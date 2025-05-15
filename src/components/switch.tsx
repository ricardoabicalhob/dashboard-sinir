import { cn } from "@/lib/utils"
import * as React from "react"
import { Button } from "./ui/button"

const Switch = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={ cn("flex gap-2 -mt-4", className) }
        { ...props }
    >
        { children }          
    </div>
))
Switch.displayName = "Switch"

interface SwitchButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    disableButton :boolean
    setDisableButton :()=> void
}

const SwitchButton = React.forwardRef<
    HTMLButtonElement,
    SwitchButtonProps
>(({ disableButton, setDisableButton, className, children, ...props }, ref) => (
    <Button
        ref={ref}
        disabled={disableButton}
        onClick={()=> setDisableButton()}
        className={ cn("flex w-fit h-fit py-2 px-3 bg-[#00BCD4] hover:bg-[#00BCD480] shadow-md shadow-gray-500 rounded-xl", className) }
        { ...props }
    >
        { children }
    </Button>
))
SwitchButton.displayName = "SwitchButton"

export {
    Switch,
    SwitchButton
}