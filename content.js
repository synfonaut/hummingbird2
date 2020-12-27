const log = require("debug")("hummingbird:content");

const shapeshifter = require("./shapeshifter");
const helpers = require("./helpers");
const bitsv = require("./bitsv");

export class BitcoinContentService {

    static async processContent(bmap) {
        const txid = bmap.tx.h;
        const block = (bmap.blk ? bmap.blk.i : null);

        const content = {
        };

        if (bmap["B"]) {
            log(`detected b:// content in ${txid}`);
            content["B"] = bmap["B"];
        }

        if (bmap["MAP"]) {
            log(`detected MAP content in ${txid}`);

            // HACK: BMAPJS does the helpful thing and splits up our BOB cells into an array,
            // but it makes it more difficult to reason about...so we collapse everything down
            // but keep the original cmd
            if (Array.isArray(bmap["MAP"])) {
                for (const map of bmap["MAP"].slice(1)) { delete map["cmd"] }
                const collapsed = Object.assign.apply(null, bmap["MAP"]);
                content["MAP"] = collapsed;

            } else {
                content["MAP"] = bmap["MAP"];
            }
        }

        if (bmap["AIP"]) {
            log(`detected AIP content in ${txid}`);
            content["AIP"] = bmap["AIP"];
        }

        const keys = new Set(Object.keys(bmap));
        keys.delete("_id");
        keys.delete("tx");
        keys.delete("in");
        keys.delete("out");
        keys.delete("B");
        keys.delete("MAP");
        keys.delete("AIP");
        keys.delete("lock");
        keys.delete("i");
        keys.delete("blk");
        keys.delete("timestamp");
        for (const key of keys) {
            log(`detected custom MAP protocol ${key} ${txid} ${JSON.stringify(bmap[key])}`);
            content[key] = bmap[key];
        }

        if (Object.keys(content).length == 0) {
            return null;
        }

        content.txid = bmap.tx.h;
        content.block = block;
        return content;
    }


    static async normalize(bmap) {
        const content = await BitcoinContentService.processContent(bmap);
        if (!content) { return null }

        for (const service of BitsvContentService.getServices()) {
            if (service.matches(content)) {
                return await service.normalize(bmap, content);
            }
        }

        return null;
    }

    static getServices() {
        return [BitsvContentService, TwetchContentService, BMediaContentService];
    }
}

export class BitsvContentService extends BitcoinContentService {
    static matches(content) {
        return content["MAP"] && content["MAP"]["app"] && content["MAP"]["app"] === "Bit.sv";
    }

    static async normalize(txo, bmap) {
        log(`detected bitsv content ${txo.tx.h}`);
        const service = "bitsv";
        const MAP = bmap["MAP"] || {};
        const tags = MAP["tags"] || [];
        const type = MAP["type"];

        if (type === "content") {
            let title = MAP["title"];
            if (!title) {
                console.log("BMAP", bmap);
                throw "INVALID TITLE";
            }

            let content = `encrypted:${title}`;
            const link = `https://bit.sv/post/${txo.tx.h}`;

            const humanTitle = await bitsv.fetchTitle(txo.tx.h);
            if (humanTitle) {
                content = humanTitle;
            }

            return {
                service,
                type,
                tags,
                content,
                link,
                bmap,
            }
        } else if (type === "receipt" || type === "rating") {
            const link = `https://bit.sv/post/${MAP.txid}`;
            return {
                type,
                service,
                link,
                bmap,
            }
        } else {
            console.log(bmap);
            throw "UNKNOWN CONTENT TYPE";
        }
    }
}


export class BMediaContentService extends BitcoinContentService {
    static matches(content) {
        return content["B"];
    }

    static async normalize(txo, bmap) {
        log(`detected bmedia content ${txo.tx.h}`);
        const B = bmap["B"] || {};
        const service = "bmedia";
        const link = `https://bico.media/${txo.tx.h}`;

        if (B["content-type"] === "text/plain") {
            if (B["content"]) {
                return {
                    service,
                    type: "content",
                    link,
                    contentType: B["content-type"],
                    content: B["content"],
                    bmap,
                }
            } else {
                console.log(bmap);
                throw new Error("invalid content");
            }
        } else {
            console.log(bmap);
            throw new Error("invalid content type");
        }
    }
}


export class TwetchContentService extends BitcoinContentService {
    static matches(content) {
        return content.MAP && content.MAP.app == "twetch";
    }

    static async normalize(txo, bmap) {
        log(`detected twetch content ${txo.tx.h}`);
        const output = await BMediaContentService.normalize(txo, bmap);
        output.service = "twetch";
        output.link = `https://twetch.app/t/${txo.tx.h}`;

        const tags = helpers.extractTags(output.content);
        if (tags && tags.length > 0) {
            output.tags = tags;
        }

        return output;
    }
}

