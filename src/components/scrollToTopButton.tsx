import { useCallback, useEffect, useState } from "react"
import { Button } from "./ui/button"

const ScrollToTopButton :React.FC = () => {
    const [ showButton, setShowButton ] = useState(false)

    const handleScroll = useCallback(() => {
        const scrollTop = window.scrollY ?? document.documentElement.scroll ?? 0
        if(scrollTop > 200) {
            setShowButton(true)
        } else {
            setShowButton(false)
        }
    }, [])

    useEffect(()=> {
        window.addEventListener("scroll", handleScroll)
        return ()=> {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [handleScroll])

    const scrollToTop = ()=> {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    if(!showButton) {
        return null
    }

    return(
        <Button
            onClick={scrollToTop}
            className="fixed top-4 right-4 rounded-full h-fit w-fit p-2 bg-[#00BCD4] hover:bg-[#00BCD4] hover:brightness-110 shadow-md shadow-black/40"
        >
            <span className="material-symbols-outlined">
                vertical_align_top
            </span>
        </Button>
    )
}

export default ScrollToTopButton