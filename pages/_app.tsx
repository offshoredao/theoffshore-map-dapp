import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import Head from "next/head";
import Header from "../components/_header";

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mainnet;
const customRPC = process.env.ALCHEMY_RPC || "";  

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      // 5 For Goerli,
      chainRpc={{
        1: customRPC,
      }}
      desiredChainId={activeChainId}
    >
      <Head>
        <title>Offshore DAO </title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Offshore DAO minting page" />
      </Head>
      <Header />
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
