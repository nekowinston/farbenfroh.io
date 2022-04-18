import dynamic from 'next/dynamic'

const Faerber = dynamic(() => import('../components/faerber'), {
  ssr: false,
})

export default function Page() {
  return <Faerber />
}
