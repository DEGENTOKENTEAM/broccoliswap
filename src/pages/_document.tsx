import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

        <script
          async
          type="text/javascript"
          src="charting_library/charting_library.js">
        </script>
      </Head>
      <body className="bg-zinc-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
