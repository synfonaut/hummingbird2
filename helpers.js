const log = require("debug")("hummingbird:helpers");

export function satoshisToDollars(satoshis, bsvprice) {
  if (satoshis < 0) {
    return null;
  }

  if ((!bsvprice && bsvprice !== 0) || isNaN(bsvprice) || bsvprice < 0) {
    return null;
  }

  var val = ((satoshis / 100000000.0) * bsvprice).toLocaleString("en-US", {'minimumFractionDigits':2, 'maximumFractionDigits':2});

  if (val == "0.00" || val == "0.01") {
    val = ((satoshis / 100000000.0) * bsvprice).toLocaleString("en-US", {'minimumFractionDigits':3, 'maximumFractionDigits':3});

    // ends in 0
    if (val.length == 5 && val[4] == "0") {
      val = val.slice(0, 4);
    }
  }

  if (isNaN(val) && isNaN(val.replace(",", ""))) {
    return null;
  }

  return val;
}

export async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function numberFormat(number, length=3) {
  if (number > 0) {
    const val = number.toLocaleString("en-US", {'minimumFractionDigits':2, 'maximumFractionDigits':length});
    return val;
  } else {
    return "0";
  }
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function countpow(hash, target="") {
  if (target == "") { target = "0" }
  if (hash.length == 64 && target && hash.indexOf(target) === 0) {
    const letters = hash.split("");
    for (var i = 0; i < target.length; i++) {
      letters.shift();
    }

    let pow = 0;
    let letter = 0;
    while (letter = letters.shift()) {
      if (letter === "0") { pow++ }
      else { break }
    }

    return target.length + pow;
  }

  return 0;
}

export function countpower(hash, target) {
  let pow = countpow(hash, target);
  return Math.pow(10, pow);
}

export function humanReadableInterval(inputSeconds) {
  const days = Math.floor( inputSeconds / (60 * 60 * 24) );
  const hour = Math.floor((inputSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor(((inputSeconds % (60 * 60 * 24)) % (60 * 60)) / 60 );
  const seconds = Math.floor(((inputSeconds % (60 * 60 * 24)) % (60 * 60)) % 60 );
  const parts = [];

  if (days > 0){
    parts.push(days + ' day' + (days > 1 ? 's': ''));
  }
  if (hour > 0){
    parts.push(hour + ' hour' + (hour > 1 ? 's': ''));
  }

  if (minutes > 0){
    parts.push(minutes + ' minute' + (minutes > 1 ? 's' : ''));
  }

  if (seconds > 0){
    parts.push(seconds + ' second' + (seconds > 1 ? 's': ''));
  }

  return parts.join(" ");
}

export function getip(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

export function fromEntries(iterable) {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val
    return obj
  }, {})
}

const crypto = require("crypto");
export function hash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

const Globalize = require("globalize");
const cldrData = require("cldr-data"); 
const RelativeTime = require("relative-time").default;
Globalize.load(cldrData.entireSupplemental(), cldrData.entireMainFor("en"));
Globalize.locale("en");
export function relativeTime(date, unit="best-fit") {
  var relativeTime = new RelativeTime();
  return relativeTime.format(date, { unit });
}; 


export function formatMoney(money, digits=3) {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  return formatter.format(money);
}

const hashtagRegex = new RegExp(/(^|\s)((\$|#)[a-zA-Z0-9\_\d-\.]+)/g);
export function extractTags(content) {
  if (content) {
    const matches = content.match(hashtagRegex);
    if (Array.isArray(matches)) {
      return normalizeTags(matches).filter(match => {
        return !match.match(/^\$[0-9\.]+$/);
      });
    }
  }

  return [];
}

export function normalizeTags(tags) {
  return Array.from(new Set(tags.map(tag => {
    return tag.replace("#", "").trim().toLowerCase();
  }))).filter(tag => { return !!tag });
}

export function humanReadableHash(hash, start_length=6, end_length=2, separator="x") {
  return `${hash.slice(0, start_length)}${separator}${hash.slice(-1 * end_length)}`;
}

