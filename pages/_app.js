// pages/_app.js

import Layout from '@/components/Layout';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  // El Layout envuelve cada página, proporcionando el Navbar y el Footer
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
