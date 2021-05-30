const render = require("./lib/render");
const matchRegexp = /(\s*)(```) *(blockdiag|bpmn|seqdiag|actdiag|nwdiag|packetdiag|rackdiag|c4plantuml|ditaa|erd|graphviz|mermaid|nomnoml|puml|plantuml|svgbob|vegalite|vega|wavedrom) *\n?([\s\S]+?)\s*(\2)(\n+|$)/g;
const diagTypes = [
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
]

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
    const pako = require('pako')
    const data = Buffer.from(diagram, 'utf8')
    const compressed = pako.deflate(data, {level: 9})
    const raw = Buffer.from(compressed).toString('base64');
    raw.for.replace(/\+/g, '-').replace(/\//g, '_')
    return [server, diagramType, format, raw].join('/')
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

render.register('kroki', {
    server: "https://kroki.io"
}, hexo, matchRegexp, diagTypes, makeURL, decorateDiagram)