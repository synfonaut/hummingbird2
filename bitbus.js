const log = require("debug")("hummingbird:bitbus");

const fetchRequest = require("node-fetch");
const es = require("event-stream");

const config = require("./config");

module.exports = async function(query={}, callback) {
    const token = config.token;

    if (!token) {
        throw new Error("invalid token");
    }

    const body = JSON.stringify(query);
    log(`sending bitbus ${body} with token ${token}`);
    let found = false;
    return new Promise((resolve, reject) => {
        fetchRequest("https://txo.bitbus.network/block", {
            method: "post",
            headers: { 'Content-type': 'application/json; charset=utf-8', token },
            body,
        }).then(res => {
            if (res.status !== 200) {
                return reject(`invalid response from bitbus ${res.status}: ${res.statusText}`);
            }

            res.body.pipe(es.split()).pipe(es.mapSync(async (result) => {
                if (result) {
                    let tx;
                    try {
                        tx = JSON.parse(result);
                    } catch (e) {
                        log(`error parsing JSON result ${result}`);
                        throw e;
                    }

                    try {
                        if (await callback(tx)) {
                            found = true;
                        }
                        return result;
                    } catch (e) {
                        reject(e);
                    }

                } else {
                    log(`skipping result ${result} because it's empty`);
                    return result;
                }
            })).on("end", () => { resolve(found) }).on("error", reject)
        });
    });
}


