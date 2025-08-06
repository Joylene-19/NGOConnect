import type React from "react"
import "./global.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  )
}
