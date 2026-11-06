import React from 'react'
import Link from 'next/link'
import { InstagramIcon } from '@/components/ui/InstagramIcon'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8F4EE] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#F4A98C] selection:text-white">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFE8CC]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E6F3FF]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F4A98C] via-[#F2C1D6] to-[#C9B8E8] p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#FFFDF9] rounded-[14px] flex items-center justify-center font-black tracking-wider text-[#F4A98C] text-base">
              NC
            </div>
          </div>
          <div className="text-left">
            <div className="font-extrabold tracking-wider text-xl bg-gradient-to-r from-[#F4A98C] via-[#E2829F] to-[#76A9EA] bg-clip-text text-transparent">
              NETIZENCITY
            </div>
            <div className="text-[11px] text-[#6F6675] font-semibold">
              Virtual Diorama City &bull; @netizencity.id
            </div>
          </div>
        </Link>
      </div>

      {/* Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl p-6 sm:p-8 shadow-xl">
          {children}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-[#6F6675] font-semibold flex items-center justify-center space-x-3">
          <Link href="/" className="hover:text-[#3B3340] transition-colors">
            Beranda
          </Link>
          <span>&bull;</span>
          <a
            href="https://www.instagram.com/netizencity.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-[#3B3340] transition-colors"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-[#F282A8]" />
            <span>@netizencity.id</span>
          </a>
        </div>
      </div>
    </div>
  )
}
