import Head from 'next/head'
import Link from 'next/link'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { keyframes } from 'styled-components'
import { Github } from 'styled-icons/fa-brands'

const Home = () => {
  return (
    <>
      <Head>
        <title>farbenfroh.io</title>
        <meta name="description" content="colorscheme all the things" />
      </Head>
      <Container>
        <Logo>farbenfroh.io</Logo>
        <div className="my-4 text-center">
          <p className="text-lg text-gray-700">/ˈfarbənfroː/</p>
          <p className="text-xs text-gray-700">[adjective]</p>
          <p className="text-xl font-bold text-gray-900">full of colour</p>
        </div>
        <div className="text-2xl">
          <span>
            Check out my new app,{' '}
            <Link href="faerber">
              <a className="relative inline-block before:absolute before:-inset-1 before:block before:skew-y-2 before:bg-gradient-to-r before:from-pink-500 before:to-violet-400">
                <span className="relative text-white">faerber!</span>
              </a>
            </Link>
          </span>
        </div>
        <div className="absolute bottom-0 m-2 w-full text-center opacity-30 transition ease-linear hover:-translate-y-1 hover:opacity-100">
          a project by{' '}
          <a href="https://github.com/nekowinston" className="text-blue-800">
            winston 🤘
          </a>
        </div>
      </Container>
    </>
  )
}

const animation = keyframes`
  0% { background-position: 0 74%; }
  50% { background-position: 100% 27%; }
  100% { background-position: 0 74%; }
`

const Container = tw(styled.div`
  animation: ${animation} 30s ease infinite;
  background: linear-gradient(270deg, #45dce4, #bd85ea, #ea858d);
  background-size: 600% 600%;
`)`
  flex 
  flex-col
  items-center
  justify-center
  h-screen
`

const Logo = tw(styled.h1`
  font-family: 'Lobster', cursive;
  background: linear-gradient(
    270deg,
    hsl(206, 100%, 20%),
    hsl(289, 100%, 20%),
    hsl(36, 100%, 20%)
  );
  background-size: 600% 600%;
  background-clip: text;
  -webkit-background-clip: text;
  animation: ${animation} 30s ease infinite;
`)`
  p-8
  text-transparent
  text-6xl
  lg:text-8xl
`

export default Home
