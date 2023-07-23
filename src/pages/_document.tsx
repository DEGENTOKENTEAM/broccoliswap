import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html
            lang="en"
            className="bg-gradient-radial from-darkblue to-dark min-w-full min-h-screen"
        >
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
                    rel="stylesheet"
                />

                <script
                    async
                    type="text/javascript"
                    src="/charting_library/charting_library.js"
                ></script>
            </Head>
            <body className="text-light-200">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
