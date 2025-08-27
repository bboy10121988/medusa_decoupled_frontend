import "./global.css"

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="studio-layout">
      {children}
    </div>
  )
}
