/**
 * a library can support both kroki and classical plantuml
 */
const http = require("http");
const https = require("https");
const fs = require('fs');
const path = require('path');

const crypto = require('crypto');
const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

/**
 * @typedef PluginConfig
 */
const config = {
    /**
     * create <img src='data:image/svg+xml;base64> or <img src="/xxx.svg"> or <img src="http://third/svg/xxx">
     * @type {("inline"|"inlineBase64"|"inlineUrlEncode"|"localLink"|"externalLink")}
     */
    link: "inlineBase64",

    /**
     * @type {("svg"|"png")}
     */
    outputFormat: "svg",
    // append some fragment per diagram, used for the theme or else config
    /**
     * @type Array<Insert>
     */
    inserts: [],

    //hidden option
    public_dir: "public",
    asset_path: "assert",
}

/**
 * @typedef Insert
 */
const insert = {
    diagram: '',
    // the line number, eg for puml: 1
    after: 0,
    // the content to insert, eg for puml: !theme sketchy-outline
    fragment: ''
}

/**
 * generate a file path but not created.
 * @param {string}base eg: base dir
 * @param {string}filename eg: xxxx.svg
 * @returns {string}
 */
function genFullFilePath(base, filename) {
    var dir = path.join(base, "puml");
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
    return path.join(dir, filename);
}
function svgAddClass(svg_txt, className) {
    let match = svg_txt.match(/<svg(.*?)>/)
    if (match && match[1].includes('class')) {
        return svg_txt.replace(/<svg(.*?)class="(.*?)"(.*?)>/, `<svg$1class="$2,${className}"$3>`)
    }
    else{
        return svg_txt.replace(/<svg(.*?)>/, `<svg$1 class="${className}">`)
    }
}
/**
 *
 * @param {PluginConfig} pluginConfig the merged config
 * @param {string}encodedUrl
 * @returns {string|Promise<string>}
 */
function serverSideRendering(pluginConfig, encodedUrl) {
    const httpReq = (encodedUrl.startsWith("https") ? https : http)
    switch (pluginConfig.link) {
        case "inlineUrlEncode":
        case "inlineBase64":
        case "inline":
            return new Promise((resolve, reject) => {
                httpReq.get(encodedUrl, response => {
                    var data = [];
                    response.on('data', function (chunk) {
                        data.push(chunk);
                    }).on('end', function () {
                        const buffer = Buffer.concat(data);
                        if (pluginConfig.link === "inlineBase64") {
                            resolve(`<img class="${pluginConfig.className}" src='data:image/svg+xml;base64,${buffer.toString("base64")}'>`);
                        } else if (pluginConfig.link === "inlineUrlEncode") {
                            resolve(`<img class="${pluginConfig.className}" src='data:image/svg+xml;utf8,${encodeURIComponent(buffer.toString())}'>`);
                        } else {
                            resolve(svgAddClass(buffer.toString(),pluginConfig.className));
                        }
                    });
                });
            })
        case "localLink":
            const base = path.join(pluginConfig.public_dir, pluginConfig.asset_path);
            if (!fs.existsSync(base)) {
                fs.mkdirSync(base, {recursive: true});
            }
            return new Promise((resolve, reject) => {
                httpReq.get(encodedUrl, response => {
                    const svgFile = genFullFilePath(base, sha256(encodedUrl)) + "." + pluginConfig.outputFormat;
                    var stream = response.pipe(fs.createWriteStream(svgFile));
                    stream.on("finish", function () {
                        const encodedUrl = svgFile.replace(pluginConfig.public_dir, "");
                        resolve(`<img class="${pluginConfig.className}" src="${encodedUrl}"/>`);
                    });
                });
            })
        case "externalLink":
            return `<img class="${pluginConfig.className}" src="${encodedUrl}" />`;
        default:
            throw new Error('unsupported link type')
    }
}

const matchConfig = {
    // see https://docs.kroki.io/kroki/setup/encode-diagram/
    kroki: {
        encoder: {
            "+": "-",
            "/": "_"
        }
    },
    // see https://plantuml.com/en/text-encoding
    plantuml: {
        encoder: {
            "0": "q",
            "1": "r",
            "2": "s",
            "3": "t",
            "4": "u",
            "5": "v",
            "6": "w",
            "7": "x",
            "8": "y",
            "9": "z",
            "A": "0",
            "B": "1",
            "C": "2",
            "D": "3",
            "E": "4",
            "F": "5",
            "G": "6",
            "H": "7",
            "I": "8",
            "J": "9",
            "K": "A",
            "L": "B",
            "M": "C",
            "N": "D",
            "O": "E",
            "P": "F",
            "Q": "G",
            "R": "H",
            "S": "I",
            "T": "J",
            "U": "K",
            "V": "L",
            "W": "M",
            "X": "N",
            "Y": "O",
            "Z": "P",
            "a": "Q",
            "b": "R",
            "c": "S",
            "d": "T",
            "e": "U",
            "f": "V",
            "g": "W",
            "h": "X",
            "i": "Y",
            "j": "Z",
            "k": "a",
            "l": "b",
            "m": "c",
            "n": "d",
            "o": "e",
            "p": "f",
            "q": "g",
            "r": "h",
            "s": "i",
            "t": "j",
            "u": "k",
            "v": "l",
            "w": "m",
            "x": "n",
            "y": "o",
            "z": "p",
            "+": "-",
            "/": "_"
        }
    }
}

/**
 * make base64 url safe again!
 * @param {string}base64
 * @param {string}defaultConfig
 */
function urlSafe(base64, defaultConfig) {
    var tmp = new Array(...base64)
    var usedMapping;

    usedMapping = matchConfig[defaultConfig || 'plantuml'].encoder

    for (var i = 0; i < tmp.length; i++) {
        let x = tmp[i]
        if (usedMapping[x]) {
            tmp[i] = (usedMapping[x]);
        } else {
            tmp[i] = (x);
        }
    }
    return tmp.join('')
}

/**
 * modify content if needed
 * @param {PluginConfig}pluginConfig the plugin's config from _config.yml
 * @param {string}diagType supported diagrams
 * @param {string}diagram the diagram content
 * @returns {string} decorated diagram content
 */
function decorateDiagram(pluginConfig, diagType, diagram) {
    var insert = (pluginConfig.inserts || []).find(x => x.diagram === diagType && x.fragment)
    if (insert) {
        diagram = appendAfterLine(diagram, insert.after, insert.fragment)
    }
    return diagram;
}

function appendAfterLine(str, line, toInsert) {
    if (line === 0) {
        return toInsert + '\n' + str;
    }
    var arr = str.split('\n')
    var tmp = ''
    for (var i = 0; i < arr.length; i++) {
        if (i === line) {
            tmp += toInsert + '\n'
        }
        tmp += arr[i] + '\n';
    }
    return tmp
}

module.exports = {
    config: config,
    matchConfig: matchConfig,
    urlSafe: urlSafe,
    decorateDiagram: decorateDiagram,
    serverSideRendering: serverSideRendering,
    appendAfterLine: appendAfterLine
}