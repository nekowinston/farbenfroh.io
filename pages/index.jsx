import Head from 'next/head'
import tw, { styled } from 'twin.macro'
import { keyframes } from 'styled-components'

const animation = keyframes`
  0% { background-position: 0 74%; }
  50% { background-position: 100% 27%; }
  100% { background-position: 0 74%; }
`

const Container = styled.div`
  ${tw`flex flex-col items-center justify-center h-screen`};
  animation: ${animation} 30s ease infinite;
  background: linear-gradient(270deg, #45dce4, #bd85ea, #ea858d);
  background-size: 600% 600%;
`

const Logo = styled.h1`
  ${tw`text-6xl text-gray-800 lg:text-8xl p-8`};
  font-family: 'Pushster', cursive;
  color: transparent;
  background: linear-gradient(
    270deg,
    hsl(206, 100%, 20%),
    hsl(289, 100%, 20%),
    hsl(36, 100%, 20%)
  );
  background-size: 600% 600%;
  background-clip: text;
  animation: ${animation} 30s ease infinite;
`

const Home = () => {
  return (
    <>
      <Head>
        <title>coming soon.</title>
        <meta name="description" content="colorscheme all the things" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Logo>farbenfroh.io</Logo>
        <div tw="text-center my-4">
          <p tw="text-gray-700 text-lg">/ˈfarbənfroː/</p>
          <p tw="text-gray-700 text-xs">[adjective]</p>
          <p tw="text-gray-900 text-xl">full of colour</p>
        </div>
      </Container>
    </>
  )
}

export default Home
