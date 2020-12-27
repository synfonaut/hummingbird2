const log = require("debug")("hummingbird:crypto");

const bsv2 = require("bsv2");
const shapeshifter = require("./shapeshifter");

export function presigHash(txo, vin) {
    const tx = shapeshifter.toTx2(txo);

    const asm = tx.txIns[vin].script;
    if (!asm) {
        throw new Error(`error while extracting presig hash, no asm ${JSON.stringify(txo)}`);
    }

    const presig = asm.chunks[0].buf;
    if (!presig) {
        throw new Error(`error while extracting presig hash, no presig ${JSON.stringify(txo)}`);
    }

    return bsv2.Hash.sha256(presig).toString("hex");
}

