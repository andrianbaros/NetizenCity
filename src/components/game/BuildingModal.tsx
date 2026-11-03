'use client'

import React from 'react'
import {
  Building2,
  Home,
  Briefcase,
  Plane,
  Vote,
  Package,
  Award,
  CheckCircle,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useGameStore } from '@/lib/stores/useGameStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

export default function BuildingModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const addNotification = useUIStore((s) => s.addNotification)
  const selectedBuilding = useGameStore((s) => s.selectedBuilding)
  const wallet = useCitizenStore((s) => s.wallet)
  const updateBalance = useCitizenStore((s) => s.updateBalance)

  const isOpen = activeModal === 'building_details'

  const buildingDataMap: Record<
    string,
    {
      title: string
      icon: React.ReactNode
      district: string
      desc: string
      actionName: string
      actionType: 'work' | 'vote' | 'inspect'
    }
  > = {
    city_hall: {
      title: 'BALAI KOTA NETIZENCITY',
      icon: <Building2 className="w-6 h-6 text-blue-400" />,
      district: 'Downtown (Pusat Kota)',
      desc: 'Pusat administrasi kota virtual dan kantor Walikota. Warga dapat berpartisipasi dalam pemungutan suara kebijakan kota.',
      actionName: 'Ikuti Polling Kebijakan Kota',
      actionType: 'vote',
    },
    industrial_factory: {
      title: 'PABRIK & LOGISTIK KURIR',
      icon: <Briefcase className="w-6 h-6 text-amber-400" />,
      district: 'Kawasan Industri',
      desc: 'Pekerjaan kurir kota: Ambil paket pesanan warga, antar ke tujuan, dan dapatkan upah 75 Netizen Coins per pengantaran.',
      actionName: 'Mulai Pengantaran Kurir (+75 Koin)',
      actionType: 'work',
    },
    apartments_block_a: {
      title: 'RUSUNAWA HARAPAN BARU BLOK A',
      icon: <Home className="w-6 h-6 text-emerald-400" />,
      district: 'Perumahan Utara',
      desc: 'Hunian bersubsidi bagi warga baru NETIZENCITY dengan fasilitas taman komunal dan keamanan 24 jam.',
      actionName: 'Periksa Unit Hunian',
      actionType: 'inspect',
    },
    airport_terminal: {
      title: 'BANDARA INTERNASIONAL NETIZEN',
      icon: <Plane className="w-6 h-6 text-sky-400" />,
      district: 'Bandara',
      desc: 'Pintu gerbang masuk wisatawan dan warga baru dari komunitas Instagram @netizencity.id.',
      actionName: 'Lihat Jadwal Kedatangan',
      actionType: 'inspect',
    },
  }

  const current =
    (selectedBuilding && buildingDataMap[selectedBuilding]) ||
    buildingDataMap.city_hall

  const handleAction = () => {
    if (current.actionType === 'work') {
      const cur = wallet?.balance ?? 500
      updateBalance(cur + 75)
      addNotification({
        title: 'Pengantaran Selesai!',
        message: 'Kamu mengantarkan paket warga dan mendapatkan +75 Netizen Coins!',
        type: 'success',
      })
      closeModal()
    } else if (current.actionType === 'vote') {
      addNotification({
        title: 'Suara Tersimpan',
        message: 'Pemerintah kota berterima kasih atas partisipasi aktifmu!',
        type: 'info',
      })
      closeModal()
    } else {
      closeModal()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={current.title} maxWidth="md">
      <div className="space-y-5">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex-shrink-0">
            {current.icon}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              {current.district}
            </span>
            <h4 className="text-base font-extrabold text-white mt-0.5">
              Fasilitas Publik Resmi
            </h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {current.desc}
            </p>
          </div>
        </div>

        {current.actionType === 'vote' && (
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-white flex items-center">
              <Vote className="w-4 h-4 mr-1.5 text-blue-400" />
              Polling Berjalan: Fasilitas Baru Apa Yang Perlu Dibangun?
            </span>
            <div className="space-y-1.5 pt-1 text-slate-300">
              <label className="flex items-center space-x-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input type="radio" name="poll" defaultChecked className="text-blue-600" />
                <span>Stadion Olahraga &amp; Mini-Game Sepakbola</span>
              </label>
              <label className="flex items-center space-x-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input type="radio" name="poll" className="text-blue-600" />
                <span>Museum Seni Pixel &amp; Bioskop Terbuka</span>
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={closeModal}>
            Tutup
          </Button>
          <Button variant="primary" onClick={handleAction}>
            {current.actionName}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
