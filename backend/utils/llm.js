import { AKASH_API_KEY, groq } from "../config/index.js";
import axios from "axios";
import { AKASH_API_URL } from "../constants/index.js";

export const akashGenerateContent = async (prompt) => {
  const AKASH_MODEL_NAME = "Meta-Llama-3-1-405B-Instruct-FP8";

  try {
    const config = {
      headers: {
        Authorization: AKASH_API_KEY,
      },
    };

    const data = {
      model: AKASH_MODEL_NAME,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    const response = await axios.post(AKASH_API_URL, data, config);

    return {
      content: response.data.choices[0].message.content,
      modelName: AKASH_MODEL_NAME,
    };
  } catch (error) {
    return error;
  }
};

export const groqGenerateContent = async (prompt) => {
  const GROQ_MODEL_NAME = "llama3-groq-70b-8192-tool-use-preview";

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL_NAME,
    });

    return {
      content: chatCompletion.choices[0].message.content,
      modelName: GROQ_MODEL_NAME,
    };
  } catch (error) {
    return error;
  }
};
