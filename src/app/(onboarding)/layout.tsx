import React from 'react'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#3B3340] flex flex-col justify-center items-center p-4 relative selection:bg-[#F4A98C] selection:text-white">
      {/* Ambient pastel glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFE8CC]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-2xl">{children}</div>
    </div>
  )
}
