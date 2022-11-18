import dynamic from 'next/dynamic'
import Octocat from '../components/Octocat'

const Faerber = dynamic(() => import('../components/faerber'), {
  ssr: false,
})

export default function Page() {
  return (
    <div className="bg-base">
      <Octocat
        catColor="#1e293b"
        isPride={true}
        repository="farbenfroh/farbenfroh.io"
      />
      <Faerber />
    </div>
  )
}
