import Link from 'next/link'
import React, { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import NavBar from '@/components/navbar'
import { NextSeo } from 'next-seo'

const Faerber: ComponentType = dynamic(() => import('@/components/faerber'), {
  ssr: false,
})

const Home: React.FC = (): JSX.Element => {
  return (
    <>
      <NextSeo title="faerber" />
      <div className="max-w-screen overflow-hidden">
        <NavBar />
        <div className="rounded-lg bg-base text-text md:m-4">
          <Faerber />
        </div>
        <div className="m-2 w-full text-center text-text opacity-30 transition ease-linear hover:-translate-y-1 hover:opacity-100">
          a project by{' '}
          <Link
            href="https://github.com/nekowinston"
            className="text-cyan-700 hover:text-cyan-800"
          >
            winston 🤘
          </Link>
        </div>
      </div>
    </>
  )
}

export default Home
