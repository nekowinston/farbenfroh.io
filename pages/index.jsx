import Head from 'next/head'
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
        <a href="https://github.com/farbenfroh">
          <Github className="h-12 w-12" />
        </a>
        <p className="absolute bottom-0 m-2 opacity-30 transition ease-linear hover:-translate-y-1 hover:opacity-100">
          a project by{' '}
          <a href="https://github.com/nekowinston" className="text-blue-800">
            winston
          </a>
        </p>
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
  font-family: 'Pushster', cursive;
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
