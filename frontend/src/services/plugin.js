import axios from "axios";
import { BACKEND_BASE_URL } from "@/constants/index.js";

const BASE_URL = `${BACKEND_BASE_URL}/api/plugin`;

const addReaction = async ({
  username,
  signature,
  reaction,
  userAddress,
  assetAddress,
}) => {
  try {
    return await axios.post(BASE_URL, {
      username,
      signature,
      reaction,
      userAddress,
      assetAddress,
    });
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};

const removeReaction = async ({
  username,
  signature,
  reaction,
  userAddress,
  assetAddress,
}) => {
  try {
    return await axios.delete(BASE_URL, {
      data: {
        username,
        signature,
        reaction,
        userAddress,
        assetAddress,
      },
    });
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};

export default { addReaction, removeReaction };
