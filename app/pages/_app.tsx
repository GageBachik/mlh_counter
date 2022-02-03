import '../styles/globals.css'
import type { AppProps } from 'next/app'
import WalletAdapter from '../components/WalletAdapter'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletAdapter>
      <Component {...pageProps} />
    </WalletAdapter>
  )
}

export default MyApp
