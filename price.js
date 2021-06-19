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

/*
let cryptocompare_price_timeout = 0;
let cryptocompare_expire = 60 * 10;
let cryptocompare_price = null;
let cryptocompare_checking = false;
export async function getBSVUSDFromCryptoCompare(api_key) {
  return new Promise((resolve, reject) => {

    const now = Math.floor(Date.now() / 1000);
    const diff = now - cryptocompare_price_timeout;
    if (diff >= cryptocompare_expire) {
      log(`cache busting backup bsvusd price`);
      cryptocompare_price_timeout = now;
    } else {
      if (cryptocompare_price !== null) {
        log(`using cached BSVUSD price of ${cryptocompare_price} from cryptocompare API for ${cryptocompare_expire - diff} more seconds`);
        resolve(cryptocompare_price);
        return;
      }
    }


    const url = `https://min-api.cryptocompare.com/data/price?fsym=BSV&tsyms=USD&api_key=${api_key}`;

    const https = require('https');

    https.get(url, (resp) => {
      log(`live hitting cryptocompare API for bsvusd price`);

      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        try {
          const obj = JSON.parse(data);
          if (!obj || !obj.USD) {
            throw new Error(`invalid bsvusd price data object from cryptocompare ${data}`);
          }

          const num = Number(obj.USD);
          if (isNaN(num)) {
            throw new Error(`invalid bsvusd price data returned from cryptocompare ${num}`);
          }

          log(`fetched BSVUSD price ${num} from cryptocompare API`);
          cryptocompare_price = num;

          resolve(num);
        } catch (e) {
          reject(`error while parsing cryptocompare price data ${e.message}`);
        }
      });

    }).on("error", (err) => {
      reject(`error while fetching cryptocompare price data ${err.message}`);
    });
  });
}

export async function getBSVUSDFromCryptonator() {
  https://api.cryptonator.com/api/full/bsv-usd

}

export async function cryptonator(ms) {
}
*/
