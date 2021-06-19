const log = require("debug")("hummingbird:price");

const bent = require("bent");
const getJSON = bent("json");

const memoize = require('p-memoize');

export const SERVICE_CRYPTOCOMPARE = "cryptocompare";
export const SERVICE_CRYPTONATOR = "cryptonator";

export const API_KEYS = {
};

export function setAPIKey(api, key) {
  API_KEYS[api] = key;
}

let last_bsvusd_price = 180;

export async function liveBSVUSD() {

  let price;

  log(`live hitting bsvusd price`);


  try {
    if (API_KEYS[SERVICE_CRYPTOCOMPARE]) {
      price = await getBSVUSDFromCryptoCompare(API_KEYS[SERVICE_CRYPTOCOMPARE]);
    } else {
      throw new Error("no known API keys");
    }
  } catch (e) {
    log(`error: ${e}`);

    try {
      price = await getBSVUSDFromCryptonator();
    } catch (e) {
      log(`error: ${e} ...unable to retrieve live price, using last one instead ${last_bsvusd_price}`);
      return last_bsvusd_price;
    }
  }

  last_bsvusd_price = price;

  log(`found bsvusd price of ${price}`);

  return price;
}

export const bsvusd = memoize(liveBSVUSD, {
  maxAge: 60 * 1000 * 60,
});

export async function getBSVUSDFromCryptoCompare(api_key) {
  const url = `https://min-api.cryptocompare.com/data/price?fsym=BSV&tsyms=USD&api_key=${api_key}`;
  log(`live hitting cryptocompare API for bsvusd price ${url}`);
  const json = await getJSON(url);

  const price = Number(json.USD);
  if (isNaN(price)) {
    throw new Error(`invalid bsvusd price data returned from cryptocompare ${price}`);
  }

  return price;
}

export async function getBSVUSDFromCryptonator() {
  const url = `https://api.cryptonator.com/api/full/bsv-usd`;
  log(`live hitting cryptonator API for bsvusd price ${url}`);
  const json = await getJSON(url);

  const price = Number(json.ticker.price);
  if (isNaN(price)) {
    throw new Error(`invalid bsvusd price data returned from cryptonator ${price}`);
  }

  return price;
}

