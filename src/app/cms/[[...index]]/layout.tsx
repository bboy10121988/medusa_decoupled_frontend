import "../global.css"

export default function CMSCatchAllLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="cms-layout">
      {children}
    </div>
  )
}
