import { generateUplift } from "../utils/uplift.js";

const getUplift = async (req, res) => {
  const body = req.body;
  if (!body.username)
    return res.status(400).json({ message: "username not provided" });

  try {
    const uplift = await generateUplift(body.username);
    if (!uplift)
      return res.status(500).json({ error: "Failed to generate uplift" });
    return res.json({ message: uplift });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "An unknown error occurred" });
  }
};

export default { getUplift };
