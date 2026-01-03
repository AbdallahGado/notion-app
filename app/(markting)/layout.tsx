import { Navbar } from "./_components/navbar";
import Head from "next/head";
import Script from "next/script";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Head>
        <title>
          Jotion – The connected workspace where better, faster work happens
        </title>
        <meta
          name="description"
          content="Jotion brings your notes, docs, and tasks together in one beautiful, collaborative workspace."
        />
        <meta
          property="og:title"
          content="Jotion – The connected workspace where better, faster work happens"
        />
        <meta
          property="og:description"
          content="Jotion brings your notes, docs, and tasks together in one beautiful, collaborative workspace."
        />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jotion.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Jotion – The connected workspace where better, faster work happens"
        />
        <meta
          name="twitter:description"
          content="Jotion brings your notes, docs, and tasks together in one beautiful, collaborative workspace."
        />
        <meta name="twitter:image" content="/logo.png" />
      </Head>
      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>
        </>
      )}
      <div className="h-full dark:bg-[#1F1F1F]">
        <main className="h-full pt-28">
          <Navbar />
          {children}
        </main>
      </div>
    </>
  );
};
export default MarketingLayout;
