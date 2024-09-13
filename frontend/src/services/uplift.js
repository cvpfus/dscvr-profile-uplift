import axios from "axios";
import { BACKEND_BASE_URL } from "@/constants/index.js";

const BASE_URL = `${BACKEND_BASE_URL}/api/llm`;

const generateUplift = async (username) => {
  const data = {
    username,
  };

  try {
    return await axios.post(BASE_URL, data);
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};

export default { generateUplift };
