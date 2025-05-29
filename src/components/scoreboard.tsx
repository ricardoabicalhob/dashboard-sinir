import { cn } from "@/lib/utils"
import { Info } from "lucide-react"
import * as React from "react"

const Scoreboard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={ cn("rounded-xl border bg-card text-card-foreground shadow p-6", className) }
        { ...props }
    >
        <div className="grid grid-flow-col gap-2 divide-x auto-cols-fr">
            {children}    
        </div>            
    </div>
))
Scoreboard.displayName = "Scoreboard"

const ScoreboardItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={ cn("flex flex-col items-center justify-between gap-2", className) }
        { ...props }
    >
        {children}
    </div>
))
ScoreboardItem.displayName = "ScoreboardItem"

const ScoreboardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={ cn("text-lg font-normal text-center px-4", className) }
    {...props}
  >
    {children}
  </p>
));
ScoreboardTitle.displayName = "ScoreboardTitle"

const ScoreboardSubtitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
    <p
        ref={ref}
        className={ cn("text-sm font-light text-center", className) }
        { ...props }
    >{ children }</p>
))
ScoreboardSubtitle.displayName = "ScoreboardSubtitle"

const ScoreboardMainText = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
    <p
        ref={ref}
        className={ cn("text-3xl font-semibold text-[#00BCD4]", className) }
        { ...props }
    >
        { children } <span className="text-2xl">T</span>
    </p>
))
ScoreboardMainText.displayName = "ScoreboardMainText"

const ScoreboardInfoText = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={ cn("flex w-full gap-2 items-center justify-start text-[10px] font-light", className) }
        { ...props }
    >
        <Info className="w-4 h-4"/>
        { children }
    </div>
))
ScoreboardInfoText.displayName = "ScoreboardInfoText"

export {
    Scoreboard,
    ScoreboardItem,
    ScoreboardTitle,
    ScoreboardSubtitle,
    ScoreboardMainText,
    ScoreboardInfoText
}