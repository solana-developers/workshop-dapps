import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Twitter</title>
        <meta
          name="description"
          content="Solana Twitter"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
