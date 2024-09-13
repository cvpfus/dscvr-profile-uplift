import axios from "axios";
import { COLLECTION_ADDRESS, GRAPHQL_API_URL } from "../constants/index.js";
import { getUmi } from "./umi.js";

export const getFirstTwoLetters = (username) => {
  return username.substring(0, 2).toUpperCase();
};

export const formatFollowerCount = (num) => {
  if (num <= 1) return `${num} follower`;
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k followers";
  }
  return `${num.toString()} followers`;
};

const getUserInfo = async (username) => {
  const query = `
    query ($username: String!) {
      userByName(name: $username) {
        id
        username
        bio
        followerCount
        wallets {
          walletChainType
          walletType
          address
          isPrimary
        }
        iconUrl
      }
    }
`;

  return await axios.post(GRAPHQL_API_URL, {
    query,
    variables: {
      username,
    },
  });
};

const hasUserMinted = (assets, username) => {
  return assets.items.some((item) =>
    item.plugins?.attributes?.data?.attribute_list?.some(
      (attr) =>
        attr.key === "owner" &&
        attr.value?.toLowerCase() === username.toLowerCase(),
    ),
  );
};

export const checkUserNft = async (username) => {
  // check if the user has already minted an NFT
  let currentPage = 1;
  let umi = getUmi();

  const assets = await umi.rpc.getAssetsByGroup({
    groupKey: "collection",
    groupValue: COLLECTION_ADDRESS,
  });

  const total = assets.total;
  const limit = assets.limit;

  let userHasMinted = hasUserMinted(assets, username);

  if (userHasMinted) throw new Error("You have reached mint limit");

  let currentTotal = total;
  let currentLimit = limit;

  while (currentTotal === currentLimit) {
    umi = getUmi();
    currentPage += 1;

    const nextAssets = await umi.rpc.getAssetsByGroup({
      groupKey: "collection",
      groupValue: COLLECTION_ADDRESS,
      page: currentPage,
    });

    userHasMinted = hasUserMinted(nextAssets, username);

    if (userHasMinted) throw new Error("You have reached mint limit");

    currentTotal = nextAssets.total;
    currentLimit = nextAssets.limit;
  }
};

export const validatedUserInfo = async (username) => {
  let userIcon;

  const userInfoResponse = await getUserInfo(username);

  if (userInfoResponse.data.errors || !userInfoResponse.data.data.userByName)
    throw new Error("Error fetching user info");

  const userByName = userInfoResponse.data.data.userByName;
  const userWallets = userByName.wallets;
  userIcon = userByName.iconUrl;

  if (!userIcon) {
    userIcon = `https://ui-avatars.com/api/?name=${username}&size=256&background=random`;
  }

  if (userWallets.length === 0)
    throw new Error(
      "The connected wallet is either not paired or the 'Allow Frames' setting is turned off",
    );

  const userSolanaWallets = userWallets
    .filter((wallet) => wallet.walletChainType === "solana")
    .map((wallet) => wallet.address.toLowerCase());

  if (!userSolanaWallets) throw new Error("Wallet chain is not supported");

  return {
    wallets: userSolanaWallets,
    followerCount: userByName.followerCount,
    iconUrl: userIcon,
  };
};
