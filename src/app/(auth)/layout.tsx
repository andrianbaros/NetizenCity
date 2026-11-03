import React from 'react'
import Link from 'next/link'
import { InstagramIcon } from '@/components/ui/InstagramIcon'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-blue-600 selection:text-white">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black tracking-wider text-blue-400 text-base">
              NC
            </div>
          </div>
          <div className="text-left">
            <div className="font-black tracking-wider text-xl bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
              NETIZENCITY
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Virtual Social City &bull; @netizencity.id
            </div>
          </div>
        </Link>
      </div>

      {/* Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {children}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-3">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Beranda
          </Link>
          <span>&bull;</span>
          <a
            href="https://www.instagram.com/netizencity.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-slate-300 transition-colors"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>@netizencity.id</span>
          </a>
        </div>
      </div>
    </div>
  )
}
