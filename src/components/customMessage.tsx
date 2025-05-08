interface CustomMessageProps {
    message :string
}

export default function CustomMessage({ message } :CustomMessageProps) {
    return(
        <div className="absolute flex w-full h-full z-50 top-0 items-center justify-center bg-black/80">
            <p className={`flex w-fit h-fit rounded-md justify-center text-center bg-transparent text-white brightness-75 shadow-lg px-2 py-1`}>{message}</p>
        </div>
    )
}