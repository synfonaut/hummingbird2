const assert = require("assert");

const hummingbird = require("../index");

const rawtx = require("./data/763a210ed3c2e2331381c5f6481fd97d72ba322db4374e8ce0dcfe6817123f07.json");
const unpaddedtagrawtx = require("./data/f444715450210b7158c8edb9d745844540a54cc5f287c90ff207e90b7861b268.json");
const unpaddedtagrawtx2 = require("./data/233c683f3c2b0fe396b85b2f2e72917211d38138ae52b9e1b786c5ac5bbabfa8.json");
const hashtargetrawtx = require("./data/5fcc3be69b8b9a556d4e1e044ccf1c15eb62d164254c133dbd13ee07c89b5add.json");
const baemailrawtx = require("./data/c12479e31e9e2f56e4d85050a1a4ddbf85a564b640da2fd6813064fad5d8300e.json");

describe("boostpow", () => {
    it("extracts boostpow output", async () => {
        const txo = hummingbird.shapeshifter.toTxo(rawtx);
        assert(txo);
        assert.equal(txo.tx.h, "763a210ed3c2e2331381c5f6481fd97d72ba322db4374e8ce0dcfe6817123f07");

        const output = await hummingbird["boostpow"].extractOutput(txo, 1);

        assert(output);
        assert.equal(output.puzzle_type, "boostpow");
        assert.equal(output.utxo, "763a210ed3c2e2331381c5f6481fd97d72ba322db4374e8ce0dcfe6817123f07:1");
        assert.equal(output.vout, 1);
        assert.equal(output.value, 2000);
        assert.equal(output.address, "17Xh8vD6GF4YGBvpBbNywe4NE326i5Zsqn");
        assert.equal(output.hash, "2735b046d549eade15cf601a64f3db85c2c62830c5eb057b4269ae2892ec4163");
        assert.deepEqual(output.tags, ["$osg"]);
        assert(output.raw_txo);
    });

    // TODO: add this test back when boostpow loosens restrictions around data formatting
    it.skip("extracts boostpow output with unpadded tag", async () => {
        const txo = hummingbird.shapeshifter.toTxo(unpaddedtagrawtx);
        assert(txo);
        assert.equal(txo.tx.h, "f444715450210b7158c8edb9d745844540a54cc5f287c90ff207e90b7861b268");

        const output = await hummingbird["boostpow"].extractOutput(txo, 4);

        assert(output);
        assert.equal(output.puzzle_type, "boostpow");
        assert.equal(output.utxo, "f444715450210b7158c8edb9d745844540a54cc5f287c90ff207e90b7861b268:4");
        assert.equal(output.vout, 4);
        assert.equal(output.value, 1200);
        assert.equal(output.address, "1CeJZk9X21hmgBCRgJCyKWDkv95XaMeKuJ");
        assert.equal(output.hash, "688fc64edcea2fd0d5d747b91aca7f2d996b3692823afb901ecc3f5d73f43368");
        assert.deepEqual(output.tags, ["economics"]);
        assert(output.raw_txo);
    });

    // TODO: add this test back when boostpow loosens restrictions around data formatting
    it.skip("extracts boostpow output with unpadded tag (x2)", async () => {
        const txo = hummingbird.shapeshifter.toTxo(unpaddedtagrawtx2);
        assert(txo);
        assert.equal(txo.tx.h, "233c683f3c2b0fe396b85b2f2e72917211d38138ae52b9e1b786c5ac5bbabfa8");

        const output = await hummingbird["boostpow"].extractOutput(txo, 4);

        assert(output);
        assert.equal(output.puzzle_type, "boostpow");
        assert.equal(output.utxo, "233c683f3c2b0fe396b85b2f2e72917211d38138ae52b9e1b786c5ac5bbabfa8:4");
        assert.equal(output.vout, 4);
        assert.equal(output.value, 800);
        assert.equal(output.address, "1PwEKiMqeUk5ox5vyahYeSidXz5huWZp6c");
        assert.equal(output.hash, "2b56df5083c93ae06ab7ed336a8d65f44b0fb0d62020628a6716b85034ec0e51");
        //assert.deepEqual(output.tags, ["economics"]);
        assert(output.raw_txo);
    });

    // TODO: add this test back when boostpow loosens restrictions around data formatting
    it.skip("extracts boostpow tag that's a hash", async () => {
        const txo = hummingbird.shapeshifter.toTxo(hashtargetrawtx);
        assert(txo);
        assert.equal(txo.tx.h, "5fcc3be69b8b9a556d4e1e044ccf1c15eb62d164254c133dbd13ee07c89b5add");

        const output = await hummingbird["boostpow"].extractOutput(txo, 4);

        assert(output);
        assert.equal(output.puzzle_type, "boostpow");
        assert.equal(output.utxo, "5fcc3be69b8b9a556d4e1e044ccf1c15eb62d164254c133dbd13ee07c89b5add:4");
        assert.equal(output.vout, 4);
        assert.equal(output.value, 800);
        assert.equal(output.address, "1PwEKiMqeUk5ox5vyahYeSidXz5huWZp6c");
        assert.equal(output.target, "");
        assert.equal(output.hash, "652abb4c6603d5f61a55c68a8e3a8e5ad18d497b132620ff0e172f8a24a4df11");
        assert.deepEqual(output.tags, ["10a79314ec6358c699d2fb6143b8a71e027a86b8", "$test", "test"]);
        assert(output.raw_txo);
    });
});

