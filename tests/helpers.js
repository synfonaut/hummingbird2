const assert = require("assert");

const helpers = require("../helpers");

describe("helpers", () => {
    it("extract hashtags", async () => {
        assert.deepEqual(["there", "we"], helpers.extractTags("hello world #there #we go"));
        assert.deepEqual(["there", "we"], helpers.extractTags("hello world #there #we go $2180"));
        assert.deepEqual(["there", "we", "$21e8"], helpers.extractTags("hello world #there #we go $21e8"));
        assert.deepEqual(["there", "we"], helpers.extractTags("hello world #there #we go $21.80"));
    });
});

