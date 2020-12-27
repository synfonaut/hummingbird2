import ShapeShifter from "./@libitx/shapeshifter.js"

const bsv = require("bsv");
const bsv2 = require("bsv2");
const bmapjs = require("./bmap");
const bitfs = require("./bitfs");

export const library = ShapeShifter;

export const toTx = (rawtx) => {
    return bsv.Transaction(ShapeShifter.toHex(rawtx));
}

export const toTx2 = (rawtx) => {
    return bsv2.Tx.fromHex(ShapeShifter.toHex(rawtx));
}

export const toTxo = (anytx) => {
    return ShapeShifter.toTxo(anytx);
}

export const toRaw = (anytx) => {
    return ShapeShifter.toHex(anytx);
}

export const toHex = toRaw;

export const toBmap = (txo) => {
    return bmapjs.TransformTx(ShapeShifter.toBob(txo));
}

export const toExpandedTxo = async (txo) => {
    return await bitfs.fetchURIAttributes(txo);
}

export const toExpandedBmap = async (txo) => {
    return toBmap(await bitfs.fetchURIAttributes(txo));
}
