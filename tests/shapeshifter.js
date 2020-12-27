const assert = require("assert");

const hummingbird = require("../index");

const rawtx = require("./data/rawtx.json");
const txou = require("./data/txou.json");

describe("Hummingbird Shapeshifter", () => {

    it("converts rawtx to tx", async () => {
        const tx = hummingbird.shapeshifter.toTx(rawtx);
        assert(tx);
        assert(tx.outputs);
        assert(tx.inputs);
    });

    it("converts rawtx to tx2", async () => {
        const tx2 = hummingbird.shapeshifter.toTx2(rawtx);
        assert(tx2);
        assert(tx2.txOuts);
        assert(tx2.txIns);
    });

    it("converts rawtx to txo", async () => {
        const txo = hummingbird.shapeshifter.toTxo(rawtx);
        assert(txo);
        assert(txo.tx.h);
        assert(txo.out);
        assert(txo.in);
        assert.equal(txo.tx.h, "b49081cdf226c5c9cf6c7b41c153fa79163c72c71f52c688e5f3ada8309f513d");
    });

    it("converts rawtx to bmap", async () => {
        const bmaptx = hummingbird.shapeshifter.toBmap(rawtx);
        assert(bmaptx);
        assert(bmaptx.MAP);
        assert(bmaptx.METANET);
        assert(bmaptx.tx.h);
        assert(bmaptx.out);
        assert(bmaptx.in);
        assert.equal(bmaptx.tx.h, "b49081cdf226c5c9cf6c7b41c153fa79163c72c71f52c688e5f3ada8309f513d");
    });

    it("expands bitfs attributes", async () => {
        assert(txou);
        assert(txou.out[0].f17);
        assert(!txou.out[0].s17);
        assert.equal(txou.out[0].f17, "b49081cdf226c5c9cf6c7b41c153fa79163c72c71f52c688e5f3ada8309f513d.out.0.17");

        assert(hummingbird.bitfs.hasURIAttributes(txou));

        const txo = await hummingbird.bitfs.fetchURIAttributes(txou);
        assert(txo);
        assert(!txo.out[0].f17);
        assert(txo.out[0].s17);
        assert.equal(txo.out[0].s17, "hy/e+Py6tTvMfWlWu6WJ7ZU0JGBNz6uLR6UowUcHmPjzjvGQCi3Jc8iViyZcXcYdfm63i00wKkhgtfRRZA+MkHkGdVUDwlPKN8CiO8vNiJvjcpOn9aD0IBDNXYHNmWqjfikbjx7QKXQSEH6GwQXxKf4z3vjX/ns6CR/AiF9dhgM0yyESpKjj3BOoNyne4wJ7WVHXPpbwi1sZeOxdgfkBll0yruF/w9FYI41rb38Tyj71dc37H7EK1/u+ml0gJAhJfn2gh5DDghscIBz+08xVQS7F1CH1Z4HUt5DFvUXcR+e4FgUjB8Sknq7e/U12kb6GK+FGAJq3q/JPJH6DR/MKSSu8sSbY1NjDsxQH25+cKUj9jb8A1kUPvDQvhhMrCb5N31abewkqGpbEeOo1xAEDPQLMgf2L0DFoPhvxpBvL4tibPihCNSfn8O20fKzOZwag9G2NxfSypzBNA0hxp6UrvIf9lM5Lq3dnHyk4v5JHL3JJwO6Y6sgv8KifJOY4VSUkTMDGqWebePfE47ao8We9ySJzdFXYdpiTreIbZUkFovVbMu3NxM/TapQQqnOAIWyaih/FjmyGmRiu1060ib8=");
    });

    it("converts bitfs tx to expanded txo", async () => {
        assert(txou);
        assert(txou.out[0].f17);
        assert(!txou.out[0].s17);
        assert.equal(txou.out[0].f17, "b49081cdf226c5c9cf6c7b41c153fa79163c72c71f52c688e5f3ada8309f513d.out.0.17");

        const txo = await hummingbird.shapeshifter.toExpandedTxo(txou);
        assert(txo);
        assert(!txo.out[0].f17);
        assert(txo.out[0].s17);
        assert.equal(txo.out[0].s17, "hy/e+Py6tTvMfWlWu6WJ7ZU0JGBNz6uLR6UowUcHmPjzjvGQCi3Jc8iViyZcXcYdfm63i00wKkhgtfRRZA+MkHkGdVUDwlPKN8CiO8vNiJvjcpOn9aD0IBDNXYHNmWqjfikbjx7QKXQSEH6GwQXxKf4z3vjX/ns6CR/AiF9dhgM0yyESpKjj3BOoNyne4wJ7WVHXPpbwi1sZeOxdgfkBll0yruF/w9FYI41rb38Tyj71dc37H7EK1/u+ml0gJAhJfn2gh5DDghscIBz+08xVQS7F1CH1Z4HUt5DFvUXcR+e4FgUjB8Sknq7e/U12kb6GK+FGAJq3q/JPJH6DR/MKSSu8sSbY1NjDsxQH25+cKUj9jb8A1kUPvDQvhhMrCb5N31abewkqGpbEeOo1xAEDPQLMgf2L0DFoPhvxpBvL4tibPihCNSfn8O20fKzOZwag9G2NxfSypzBNA0hxp6UrvIf9lM5Lq3dnHyk4v5JHL3JJwO6Y6sgv8KifJOY4VSUkTMDGqWebePfE47ao8We9ySJzdFXYdpiTreIbZUkFovVbMu3NxM/TapQQqnOAIWyaih/FjmyGmRiu1060ib8=");
    });

    it("converts bitfs tx to expanded bmap", async () => {
        assert(txou);
        assert(txou.out[0].f17);
        assert(!txou.out[0].s17);
        assert.equal(txou.out[0].f17, "b49081cdf226c5c9cf6c7b41c153fa79163c72c71f52c688e5f3ada8309f513d.out.0.17");

        const bmap = await hummingbird.shapeshifter.toExpandedBmap(txou);
        assert.equal(bmap.MAP[0].title, "hy/e+Py6tTvMfWlWu6WJ7ZU0JGBNz6uLR6UowUcHmPjzjvGQCi3Jc8iViyZcXcYdfm63i00wKkhgtfRRZA+MkHkGdVUDwlPKN8CiO8vNiJvjcpOn9aD0IBDNXYHNmWqjfikbjx7QKXQSEH6GwQXxKf4z3vjX/ns6CR/AiF9dhgM0yyESpKjj3BOoNyne4wJ7WVHXPpbwi1sZeOxdgfkBll0yruF/w9FYI41rb38Tyj71dc37H7EK1/u+ml0gJAhJfn2gh5DDghscIBz+08xVQS7F1CH1Z4HUt5DFvUXcR+e4FgUjB8Sknq7e/U12kb6GK+FGAJq3q/JPJH6DR/MKSSu8sSbY1NjDsxQH25+cKUj9jb8A1kUPvDQvhhMrCb5N31abewkqGpbEeOo1xAEDPQLMgf2L0DFoPhvxpBvL4tibPihCNSfn8O20fKzOZwag9G2NxfSypzBNA0hxp6UrvIf9lM5Lq3dnHyk4v5JHL3JJwO6Y6sgv8KifJOY4VSUkTMDGqWebePfE47ao8We9ySJzdFXYdpiTreIbZUkFovVbMu3NxM/TapQQqnOAIWyaih/FjmyGmRiu1060ib8=");
    });
});

