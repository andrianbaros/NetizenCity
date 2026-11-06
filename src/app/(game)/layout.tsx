import React from 'react'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#CDE7F0] relative selection:bg-[#F4A98C] selection:text-white">
      {children}
    </div>
  )
}
