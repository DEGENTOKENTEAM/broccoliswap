import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="bg-gradient-to-b from-slate-900 to-slate-950">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Ysabeau+Infant:wght@400;700&display=swap" rel="stylesheet" />

        <script
          async
          type="text/javascript"
          src="/charting_library/charting_library.js">
        </script>
      </Head>
      <body className="">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
