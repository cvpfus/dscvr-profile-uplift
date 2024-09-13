import { createContext, useEffect, useState } from "react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { isEmpty } from "lodash-es";

import { mplCore } from "@metaplex-foundation/mpl-core";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const UmiContext = createContext(null);

export const UmiProvider = ({ children }) => {
  const [state, setState] = useState({});

  const { connection } = useConnection();

  const wallet = useWallet();

  useEffect(() => {
    if (!isEmpty(state) && wallet.publicKey) return;

    if (wallet.publicKey) {
      const umi = createUmi(connection);
      umi.use(walletAdapterIdentity(wallet));
      umi.use(mplCore());
      setState({ umi });
    }
  }, [state, wallet]);

  return <UmiContext.Provider value={state}>{children}</UmiContext.Provider>;
};
