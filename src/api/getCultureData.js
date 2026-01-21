import cultureData from "./cultureBankData.json";

export function fetchCultureData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(cultureData), 200); // simulate loading delay
  });
}
    