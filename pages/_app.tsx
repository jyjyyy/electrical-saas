import '../styles/globals.css'; // <-- ajoute cette ligne
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}