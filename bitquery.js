export function getutxos(utxos) {
    return {
        "q": {
            "find": {
                "$or": utxos.map(utxo => {
                    const [txid, vout] = utxo.split(":");
                    return {"in": {"$elemMatch": {"e.h": txid, "e.i": Number(vout)}}};
                })
            }
        }
    };
}

export function gettxids(txids) {
    return {
        "q": {
            "find": {
                "tx.h": {"$in": txids}
            }
        }
    };
}

export function limit(query={}, num=-1) {
    const q = JSON.parse(JSON.stringify(query));

    if (!q["q"]) { q["q"] = {} }
    if (!q["q"]["find"]) { q["q"]["find"] = {} }
    q["q"]["find"]["blk.i"] = {"$gte": num };

    return q;
}

export function sort(query={}, key, dir=1) {
    const q = JSON.parse(JSON.stringify(query));

    if (!q["q"]) { q["q"] = {} }
    if (!q["q"]["sort"]) { q["q"]["sort"] = {} }
    q["q"]["sort"][key] = dir;

    return q;
}

