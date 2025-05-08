'use client' // Error boundaries must be Client Components
 
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className='flex flex-col w-screen h-screen items-center justify-center bg-black/80'>
        <div className='flex flex-col w-[400px]'>
            <div className='flex flex-col items-center justify-between gap-3 p-6 w-full h-fit bg-white'>
                <h1 className='text-gray-700'>Erro!</h1>
                <h2 className='text-gray-700'>{error.message}</h2>
                <Button
                    className='w-fit mt-6'
                    onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                    }
                >
                    Tente novamente
                </Button>
            </div>
        </div>
    </div>
  )
}