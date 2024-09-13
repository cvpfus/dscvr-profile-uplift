import { UMI1, UMI2 } from "../config/index.js";

let toggle = false;

export const getUmi = () => {
  console.log("toggle", toggle);
  toggle = !toggle;

  if (toggle) return UMI1;
  return UMI2;
};
