import "../globals.css"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <div className="bg-[#333] text-white">
        { children }
    </div>
  )
}