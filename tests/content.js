const assert = require("assert");

const hummingbird = require("../index");

const whatcomesnextrawtx = require("./data/whatcomesnextrawtx.json");
const twetch21e8rawtx = require("./data/733885eef1e215e0a5780dd4303ff6c762bb4933575901ed8ca5ae9c4ea6b78a.json");

describe("Hummingbird Content", () => {

    beforeEach(function() {
        hummingbird.content.BitcoinContentService.getServices = function() {
            return [hummingbird.content.BitsvContentService, hummingbird.content.TwetchContentService, hummingbird.content.BMediaContentService];
        }
    });

    it("detects bit.sv content", async () => {
        const txo = hummingbird.shapeshifter.toTxo(whatcomesnextrawtx);
        const bmap = await hummingbird.shapeshifter.toExpandedBmap(txo);

        const content = await hummingbird.content.BitcoinContentService.normalize(bmap);
        assert.equal(content.service, "bitsv");
        assert.equal(content.type, "content");
        assert.equal(content.content, "What Comes Next");
        assert.deepEqual(content.tags, ["bitcoin"]);
        assert.deepEqual(content.link, "https://bit.sv/post/499dec5108b14e99d28b48b0c0dfcd5fe06edef43ad738d41f18264151aaf30d");
    });

    it("detects b:// content", async () => {
        const txo = hummingbird.shapeshifter.toTxo(twetch21e8rawtx);
        const bmap = await hummingbird.shapeshifter.toExpandedBmap(txo);

        hummingbird.content.BitcoinContentService.getServices = function() {
            return [hummingbird.content.BitsvContentService, hummingbird.content.BMediaContentService];
        }

        const content = await hummingbird.content.BitcoinContentService.normalize(bmap);
        assert(content);
        assert.equal(content.service, "bmedia");
        assert.equal(content.type, "content");
        assert.deepEqual(content.content, "hashing.. $21e8");
        assert.deepEqual(content.link, "https://bico.media/733885eef1e215e0a5780dd4303ff6c762bb4933575901ed8ca5ae9c4ea6b78a");
    });

    it("detects twetch content", async () => {
        const txo = hummingbird.shapeshifter.toTxo(twetch21e8rawtx);
        const bmap = await hummingbird.shapeshifter.toExpandedBmap(txo);
        const content = await hummingbird.content.BitcoinContentService.normalize(bmap);

        assert(content);
        assert.equal(content.service, "twetch");
        assert.equal(content.type, "content");
        assert.deepEqual(content.content, "hashing.. $21e8");
        assert.deepEqual(content.tags, ["$21e8"]);
        assert.deepEqual(content.link, "https://twetch.app/t/733885eef1e215e0a5780dd4303ff6c762bb4933575901ed8ca5ae9c4ea6b78a");
    });

});

