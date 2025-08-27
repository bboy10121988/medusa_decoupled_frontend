import "./global.css"

export default function CMSLayout({
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
