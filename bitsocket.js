const log = require("debug")("hummingbird:bitsocket");

const EventSource = require('eventsource')

module.exports = async function(query={}, callback, finished=null, model) {
    const queryStr = JSON.stringify(query);
    log(`listening to ${queryStr}`);

    const b64 = Buffer.from(queryStr).toString("base64");
    const socket = new EventSource(`https://txo.bitsocket.network/s/${b64}`);
    let num = await model.getNumberOfMagicNumbers();
    socket.onmessage = function(msg) {
        let event;
        try {
            event = JSON.parse(msg.data);
        } catch (e) {
            log(`error parsing message ${msg}`);
            return;
        }

        if (event.type === "open") {
            log(`opened connection`);
        } else if (event.type === "push") {
            log(`received tx push`);
            Promise.all(event.data.map(callback)).then(async (results) => {
                let newNum = await model.getNumberOfMagicNumbers();
                if (newNum > num) {
                    log(`finished processing push, added ${newNum-num} magicnumbers`);
                    num = newNum;
                    if (finished) { finished() }
                } else {
                    log(`finished processing push, no new magicnumbers found`);
                }
            });
        } else {
            log(`unknown event ${JSON.stringify(msg)}`);
        }
    }

    return socket;
}


