import dynamic from 'next/dynamic'
import Head from 'next/head'
import Octocat from '../components/Octocat'

const Faerber = dynamic(() => import('../components/faerber'), {
  ssr: false,
})

export default function Page() {
  return (
    <>
      <Head>
        <title>farbenfroh.io :: faerber</title>
      </Head>
      <Octocat
        catColor="#1e293b"
        isPride={true}
        repository="farbenfroh/farbenfroh.io"
      />
      <Faerber />
    </>
  )
}
