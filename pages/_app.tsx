import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { DefaultSeo } from 'next-seo'
import { IBM_Plex_Mono, IBM_Plex_Sans, Lobster } from 'next/font/google'

const lobster = Lobster({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-lobster',
})
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-ibm-plex-sans',
})
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-ibm-plex-mono',
})
const fonts = [lobster, ibmPlexSans, ibmPlexMono]

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        themeColor="#1e1e2e"
        defaultTitle="farbenfroh.io"
        titleTemplate="farbenfroh.io :: %s"
        openGraph={{
          type: 'website',
          url: 'https://farbenfroh.io',
          title: 'farbenfroh.io',
          description: 'Make your wallpaper fit your favorite colorscheme',
        }}
      />
      <main className={fonts.map((f) => f.variable).join(' ') + ' font-sans'}>
        <Component {...pageProps} />
      </main>
      <Analytics />
    </>
  )
}
