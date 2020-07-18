const {v4: uuid} = require("uuid");

const prettyCurrency = (amount) => {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });
  const convertedAmount = formatter.format(amount);
  return convertedAmount;
};
const makeTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const createUsername = (name) => {
  let randomId = uuid().split("-")[1].toLowerCase();
  let username = name.split(" ")[0].toLowerCase();
  return [username, randomId].join("-");
};

const createUniqueid = () => {
  let random1 = uuid().split("-")[1].toLowerCase();
  let random2 = uuid().split("-")[1].toLowerCase();
  return [random1, random2].join("");
};

module.exports = {
  prettyCurrency,
  makeTitleCase,
  createUsername,
  createUniqueid

};
