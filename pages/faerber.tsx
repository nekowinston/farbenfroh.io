import dynamic from 'next/dynamic'
import Octocat from '../components/Octocat'
import { ComponentType } from 'react'

const Faerber: ComponentType = dynamic(() => import('../components/faerber'), {
  ssr: false,
})

export default function Page() {
  return (
    <div className="bg-base">
      <div className="relative z-50">
        <Octocat
          catColor="#1e293b"
          isPride={true}
          repository="nekowinston/farbenfroh.io"
        />
      </div>
      <Faerber />
    </div>
  )
}
