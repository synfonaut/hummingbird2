const log = require("debug")("hummingbird:bitsv");

const fetchRequest = require("node-fetch");

const helpers = require("./helpers");

const BITSV_BASE_URL = "https://bit.sv/post/";

const BITSV_POST_REGEX = new RegExp(/<script>\nwindow.BITSV_POST = (?<json>.*);\n<\/script>/);

export const query = {
    q: {
        find: {
            "out.s6": "1L8eNuA8ToLGK5aV4d5d9rXUAbRZUxKrhF",
        }
    }
};


export async function fetchTitle(txid) {
    const url = BITSV_BASE_URL + txid;

    log(`fetching bitsv title from ${url}`);

    const response = await fetchRequest(url);
    if (response.status === 200) {
        const body = await response.text();

        log(`successfully received bitsv ${url} ${body.length} length`);

        const match = body.match(BITSV_POST_REGEX);
        if (match && match.groups) {
            try {
                const obj = JSON.parse(match.groups.json);
                if (obj && obj.title) {
                    return obj.title;
                }
            } catch (e) {
                log(`error while parsing BITSV_POST JSON ${txid}`);
                throw e;
            }
        }

        log(`unable to find bitsv post json ${txid}`);
        return null;

    } else {
        log(`error while fetching ${url} (${response.status})`);
        throw new Error(`error while fetching ${url} (${response.status})`);
    }
}

