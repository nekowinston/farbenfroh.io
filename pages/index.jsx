import Head from 'next/head'
import tw from 'twin.macro'

const Container = tw.div`
  flex flex-col items-center justify-center h-screen
`

const Logo = tw.h1`
  text-8xl
  font-bold
`

const Header = tw.h1`
  text-center
  text-3xl
  font-bold
  mb-4
`

const Home = () => {
  return (
    <>
      <Head>
        <title>farbenfroh.io</title>
        <meta name="description" content="colorscheme all the things" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Logo>farbenfroh.io</Logo>
        <Header>coming sooner than you think.</Header>
      </Container>
    </>
  )
}

export default Home
