const log = require("debug")("hummingbird:bitfs");

const fetchRequest = require("node-fetch");

const helpers = require("./helpers");

const BITFS_BASE_URL = "https://x.bitfs.network/";

export default async function fetch(bitfsurl) {
    const url = BITFS_BASE_URL + bitfsurl;

    log(`fetching bitfs ${bitfsurl}`);

    const response = await fetchRequest(url);
    if (response.status === 200) {
        const body = await response.text();
        log(`successfully received bitfs ${bitfsurl} ${body.length} length`);
        return body;
    } else {
        log(`error while fetching ${url} (${response.status})`);
        throw new Error(`error while fetching ${url} (${response.status})`);
    }
}


export function hasURIAttributes(tx) {
    for (const out of tx.out) {
        for (const key of Object.keys(out)) {
            if (key.indexOf("f") === 0) {
                return true;
            }
        }
    }
    return false;
}

export async function fetchURIAttributes(tx) {
    if (!hasURIAttributes(tx)) {
        return tx;
    }

    const fetched = JSON.parse(JSON.stringify(tx));

    fetched.out = await Promise.all(fetched.out.map(async (out) => {
        return helpers.fromEntries(await Promise.all(Object.entries(out).map(async (entry, idx) => {
            const [key, values] = entry;
            if (key.indexOf("f") === 0) {
                const content = await fetch(out[key]);
                const newKey = key.replace("f", "s");
                return [newKey, content];
            }

            return [key, values];
        })));
    }));

    return fetched;
}

