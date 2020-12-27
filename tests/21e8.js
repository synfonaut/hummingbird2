const assert = require("assert");

const hummingbird = require("../index");

const rawtx = require("./data/763a210ed3c2e2331381c5f6481fd97d72ba322db4374e8ce0dcfe6817123f07.json");

describe("21e8", () => {
    it("extracts 21e8 output", async () => {
        const txo = hummingbird.shapeshifter.toTxo(rawtx);
        assert(txo);
        assert.equal(txo.tx.h, "763a210ed3c2e2331381c5f6481fd97d72ba322db4374e8ce0dcfe6817123f07");

        const output = await hummingbird["_21e8"].extractOutput(txo, 2);

        assert(output);
        assert.equal(output.puzzle_type, "21e8");
        assert.equal(output.utxo, "763a210ed3c2e2331381c5f6481fd97d72ba322db4374e8ce0dcfe6817123f07:2");
        assert.equal(output.vout, 2);
        assert.equal(output.value, 2000);
        assert.equal(output.address, "17Xh8vD6GF4YGBvpBbNywe4NE326i5Zsqn");
        assert.equal(output.hash, "2735b046d549eade15cf601a64f3db85c2c62830c5eb057b4269ae2892ec4163");
        assert.equal(output.target, "21e8");
        assert(output.raw_txo);
    });
});

