import React from 'react'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 relative selection:bg-blue-600 selection:text-white">
      {children}
    </div>
  )
}
