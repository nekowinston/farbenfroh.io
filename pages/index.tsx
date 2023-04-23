import Head from 'next/head'
import Link from 'next/link'
import React from 'react'

const Home: React.FC = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>farbenfroh.io</title>
        <meta name="description" content="colorscheme all the things" />
      </Head>
      <div className="index-container text-crust">
        <div className="index-logo">farbenfroh.io</div>
        <div className="my-4 text-center">
          <p className="text-lg text-mantle">/ˈfarbənfroː/</p>
          <p className="text-xs text-mantle">[adjective]</p>
          <p className="text-xl font-bold text-crust">full of colour</p>
        </div>
        <div className="text-2xl">
          <span>
            Check out{' '}
            <Link href="faerber" className="underline hover:text-cyan-800">
              faerber
            </Link>
            !
          </span>
        </div>
        <div className="absolute bottom-0 m-2 w-full text-center opacity-30 transition ease-linear hover:-translate-y-1 hover:opacity-100">
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
