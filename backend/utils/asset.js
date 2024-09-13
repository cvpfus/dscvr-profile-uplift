export const decodeSvg = (dataString) => {
  return decodeURIComponent(dataString.split(",")[1]);
};