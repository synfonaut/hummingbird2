const log = require("debug")("hummingbird:boostpow");

const assert = require("assert");

const boost = require("@matterpool/boostpow-js");
const stripHexPrefix = require("strip-hex-prefix");

const crypto = require("./crypto");
const shapeshifter = require("./shapeshifter");
const content = require("./content");
const helpers = require("./helpers");

export const library = boost;

export const query = {
    q: {
        find: {
            "out.s0": "boostpow",
            "out.o32": "OP_HASH256",
            "out.o49": "OP_HASH256",
            "out.o85": "OP_HASH160",
            "out.o86": "OP_FROMALTSTACK",
            "out.o87": "OP_EQUALVERIFY",
            "out.o88": "OP_CHECKSIG"
        }
    }
}

export function isOutput(out) {
    return (out
        && out.s0
        && out.s0 == "boostpow"
        && out.o32 == "OP_HASH256"
        && out.o49 == "OP_HASH256"
        && out.o85 == "OP_HASH160"
        && out.o86 == "OP_FROMALTSTACK"
        && out.o87 == "OP_EQUALVERIFY"
        && out.o88 == "OP_CHECKSIG"
    );
}


function normalizeBoostHexString(hexstr) {
    return Buffer.from(stripHexPrefix(hexstr), "hex").toString("utf8").replace(/^[\x00]*/, "");
}

// https://stackoverflow.com/a/1697749
function containsNonLatinCodepoints(s) {
    return /[^\u0000-\u00ff]/.test(s);
}

function normalizeBoostJob(boostJob) {
    const boostObject = boostJob.toObject();

    let target = normalizeBoostHexString(boostObject.category);

    let tag = normalizeBoostHexString(boostObject.tag).replace("#", "");
    if (containsNonLatinCodepoints(tag)) {
        tag = boostObject.tag.toString("hex");
    }

    const additionalData = normalizeBoostHexString(boostObject.additionalData);
    const diff = boostObject.diff;
    const hash = boostObject.content;

    return {
        hash,
        target,
        tag,
        additionalData,
        diff,
        boostObject
    };

}


export async function extractOutput(txo, vout) {
    const out = txo.out[vout];
    if (!isOutput(out)) { return null }

    const rawtx = shapeshifter.toRaw(txo);


    const bmap = await shapeshifter.toExpandedBmap(txo);
    const outputContent = await content.BitcoinContentService.normalize(bmap);
    if (outputContent) {
        log(`detected content ${JSON.stringify(outputContent)}`);
    }

    let boostJob;
    try {
        boostJob = library.BoostPowJob.fromRawTransaction(rawtx, vout);
    } catch (e) {
        log(`error parsing boostpow output ${JSON.stringify(txo)} in ${txo.tx.h}`);
        throw e;
        return null;
    }

    const txid = txo.tx.h;
    const block = (txo.blk ? txo.blk.i : null);

    assert.equal(out.i, vout);
    const utxo = `${txid}:${vout}`;
    const value = out.e.v;
    const created_at = (txo.blk && txo.blk.t ? new Date(txo.blk.t * 1000) : new Date());
    log(`processing boostpow puzzle ${utxo} worth ${value}`);

    const address = txo.in[0].e.a; // not completely accurate, just grab the first input

    const boostObject = normalizeBoostJob(boostJob);

    const data = {
        block,
        puzzle_type: "boostpow",
        hash: boostObject.hash,
        target: boostObject.target,
        created_at,
        utxo,
        txid,
        vout,
        value,
        address: address,
        raw_txo: txo,
    };

    const tags = (boostObject.tag ? [boostObject.tag] : []);

    if (outputContent) {
        data.content_service = outputContent.service;
        data.content_link = outputContent.link;
        data.content = outputContent.content;
        data.content_json = outputContent;
        if (outputContent.tags && outputContent.tags.length > 0) {
            for (const tag of outputContent.tags) {
                tags.push(tag);
            }

        }
    }

    if (tags.length > 0) {
        data.tags = helpers.normalizeTags(tags);
    }

    return data;
}

export async function extractPuzzleInput(txo, vin, boostJob) {

    const txid = txo.tx.h;
    const block = (txo.blk ? txo.blk.i : null);
    const input = txo.in[vin];

    const utxo = `${input.e.h}:${input.e.i}`;
    log(`processing boostpow mined puzzle ${utxo}`);

    const mined_at = (txo.blk && txo.blk.t ? new Date(txo.blk.t * 1000) : new Date());

    const spentrawtx = shapeshifter.toRaw(txo);
    const boostJobProof = library.BoostPowJobProof.fromRawTransaction(spentrawtx);
    if (!boostJobProof) {
        log(`error processing boostpow mined puzzle from ${txo.tx.h}`);
        throw new Error(`error processing boostpow mined puzzle from ${txo.tx.h}`);
    }

    const powValidation = library.BoostPowJob.tryValidateJobProof(boostJob, boostJobProof);
    if (!powValidation) {
        log(`error validating powstring from ${txo.tx.h}`);
        throw new Error(`error processing boostpow mined puzzle from ${txo.tx.h}`);
    }

    const powObject = powValidation.boostPowString.toObject();
    const magicnumber = powObject.hash;
    const powstring = powValidation.boostPowString.toString();

    const data = {
        mined: true,
        mined_at,
        mined_txid: txid,
        mined_address: txo.out[0].e.a,
        magicnumber,
        powstring,
    };

    return data;
}

