const render = require("./lib/render");
const defaultConfig = 'kroki';
const matchConfig = {
    kroki: {
        matchRegexp: /(\s*)(```) *(blockdiag|bpmn|seqdiag|actdiag|nwdiag|packetdiag|rackdiag|c4plantuml|ditaa|erd|graphviz|mermaid|nomnoml|puml|plantuml|svgbob|vegalite|vega|wavedrom) *\n?([\s\S]+?)\s*(\2)(\n+|$)/g,
        diagTypes: [
            "blockdiag",
            "bpmn",
            "bytefield",
            "seqdiag",
            "actdiag",
            "nwdiag",
            "packetdiag",
            "rackdiag",
            "c4plantuml",
            "ditaa",
            "erd",
            "graphviz",
            "mermaid",
            "nomnoml",
            "plantuml",
            "svgbob",
            "vegalite",
            "vega",
            "wavedrom"
        ],
        encoder: {
            "+": "-",
            "/": "_"
        }
    },
    // see https://plantuml.com/en/text-encoding
    plantuml: {
        matchRegexp: /(\s*)(```) *(puml|plantuml) *\n?([\s\S]+?)\s*(\2)(\n+|$)/g,
        diagTypes: [
            "plantuml"
        ],
        encoder:  {
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
 * make url for a diagram
 *
 * see https://docs.kroki.io/kroki/setup/encode-diagram/
 * @param {string}server server's url
 * @param {string}diagramType eg: vegalite, plantuml
 * @param {('svg'|'png')}format - url format
 * @param {string}diagram your diagram fragment to make the URL
 * @return {string} encoded URL
 */
function makeURL(server, diagramType, format, diagram) {
    // remove trailing slash
    server = server.replace(/\/$/,'')
    const pako = require('pako')
    const data = Buffer.from(diagram, 'utf8')
    const compressed = pako.deflate(data, {level: 9})
    var raw = Buffer.from(compressed).toString('base64');
    var tmp = new Array(...raw)
    var usedMapping;
    var usePlantUmlEncoder = server.includes('plantuml')
    if (usePlantUmlEncoder) {
        usedMapping = plantUml.encoder
    } else {
        usedMapping = krokiConfig.encoder
    }
    for (var i = 0; i < raw.length; i++) {
        let x = raw[i]
        if (usedMapping[x]) {
            tmp[i] = (usedMapping[x]);
        } else {
            tmp[i] = (x);
        }
    }
    var newStr = tmp.join('')
    if (usePlantUmlEncoder) {
        return [server, format, '~1' + newStr].join('/')
    } else {
        return [server, diagramType, format, newStr].join('/');
    }
}

/**
 * modify content if needed
 * @param {Object}pluginConfig: the plugin's config from _config.yml
 * @param {string}diagram
 * @returns {string}
 */
function decorateDiagram(pluginConfig, diagram) {
    var insert = pluginConfig.insert
    if (insert.content) {
        diagram = render.appendAfterLine(diagram, insert.afterLine, insert.content)
    }
    return diagram;
}

render.register(defaultConfig, {
    server: "https://kroki.io",
    // the img generated will have a default class name.
    className: defaultConfig,
}, hexo, matchConfig[defaultConfig].matchRegexp, matchConfig[defaultConfig].diagTypes, makeURL, decorateDiagram)