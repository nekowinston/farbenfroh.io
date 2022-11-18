import dynamic from 'next/dynamic'
import Octocat from '../components/Octocat'
import { ComponentType } from 'react'

const Faerber: ComponentType = dynamic(() => import('../components/faerber'), {
  ssr: false,
})

export default function Page() {
  return (
    <div className="bg-base">
      <Octocat
        catColor="#1e293b"
        isPride={true}
        repository="nekowinston/farbenfroh.io"
      />
      <Faerber />
    </div>
  )
}
