import React from "react"

import Nav from "@features/site-navigation/layout/templates/nav"

const Layout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div>
      <Nav />
      <main className="relative">{children}</main>
    </div>
  )
}

export default Layout
