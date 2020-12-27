const log = require("debug")("hummingbird:21e8");

const assert = require("assert");
const content = require("./content");
const shapeshifter = require("./shapeshifter");
const helpers = require("./helpers");
const crypto = require("./crypto");

export const query = {
    q: {
        find: {
            "out.o2": "OP_SIZE",
            "out.o3": "OP_4",
            "out.o4": "OP_PICK",
            "out.o5": "OP_SHA256",
            "out.o6": "OP_SWAP",
            "out.o7": "OP_SPLIT",
            "out.o8": "OP_DROP",
            "out.o9": "OP_EQUALVERIFY",
            "out.o10": "OP_DROP",
            "out.o11": "OP_CHECKSIG",
        }
    }
};


export function isOutput(out) {
    return (out
        && out.h0
        && out.h1
        && out.o2 == "OP_SIZE"
        && out.o3 == "OP_4"
        && out.o4 == "OP_PICK"
        && out.o5 == "OP_SHA256"
        && out.o6 == "OP_SWAP"
        && out.o7 == "OP_SPLIT"
        && out.o8 == "OP_DROP"
        && out.o9 == "OP_EQUALVERIFY"
        && out.o10 == "OP_DROP"
        && out.o11 == "OP_CHECKSIG");
}

export async function extractOutput(txo, vout) {
    const out = txo.out[vout];
    if (!isOutput(out)) { return null }

    const bmap = await shapeshifter.toExpandedBmap(txo);
    const outputContent = await content.BitcoinContentService.normalize(bmap);
    if (outputContent) {
        log(`detected content ${JSON.stringify(outputContent)}`);
    }

    const txid = txo.tx.h;
    const block = (txo.blk ? txo.blk.i : null);

    assert.equal(out.e.i, vout);
    const utxo = `${txid}:${vout}`;
    const value = out.e.v;
    const target = out.h1;
    const created_at = (txo.blk && txo.blk.t ? new Date(txo.blk.t * 1000) : new Date());
    log(`processing 21e8 puzzle ${utxo} worth ${value} targeting ${target}`);

    const address = txo.in[0].e.a; // not completely accurate, just grab the first input

    const data = {
        puzzle_type: "21e8",
        created_at,
        utxo,
        txid,
        vout,
        value,
        address: address,
        hash: out.h0,
        raw_txo: txo,
        target,
    };

    if (block) {
        data["block"] = block;
    }

    if (outputContent) {
        data.content_service = outputContent.service;
        data.content_link = outputContent.link;
        data.content = outputContent.content;
        data.content_json = outputContent;
        if (outputContent.tags && outputContent.tags.length > 0) {
            data.tags = helpers.normalizeTags(outputContent.tags);
        }
    }

    return data;
}

export async function extractPuzzleInput(txo, vin) {
    const txid = txo.tx.h;
    const block = (txo.blk ? txo.blk.i : null);
    const input = txo.in[vin];

    const utxo = `${input.e.h}:${input.e.i}`;
    log(`processing 21e8 mined puzzle ${utxo}`);

    const magicnumber = crypto.presigHash(txo, vin);
    const mined_at = (txo.blk && txo.blk.t ? new Date(txo.blk.t * 1000) : new Date());

    const data = {
        mined: true,
        mined_at,
        mined_txid: txid,
        mined_address: txo.out[0].e.a,
        magicnumber,
    };

    return data;
}

