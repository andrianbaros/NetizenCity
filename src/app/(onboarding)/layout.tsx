import React from 'react'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative selection:bg-blue-600 selection:text-white">
      {/* City background texture */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-2xl">{children}</div>
    </div>
  )
}
