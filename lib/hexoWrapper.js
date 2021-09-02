/**
 * Hooked by hexo
 * @param pluginName {string} hexo-filter-<pluginName>
 * @param hexo{Object} the hexo object, injected by framework.
 * @param matches {string} the regexp to capture diagram fragment
 * @param diagTypes {Array.<string>} supported diagrams
 * @param diagramHandler {diagramHandler} the function used to generate request
 */
function register(pluginName, hexo, matches, diagTypes, diagramHandler) {
    var i = 0;
    for (let diagType of diagTypes) {
        hexo.extend.tag.register(diagType, (args, diagram) => {
            return diagramHandler(args, diagType, diagram, hexo)
        }, {
            async: true,
            ends: true
        });

        hexo.extend.filter.register('before_post_render', (data) => {
            if ('.md'.indexOf(data.source.substring(data.source.lastIndexOf('.')).toLowerCase()) > -1) {
                data.content = data.content
                    .replace(matches, (raw, start, startQuote, lang, content, endQuote, end) => {
                        if (lang === 'puml') {
                            lang = 'plantuml'
                        }
                        // replace with an async call
                        return start + '{% ' + lang + ' %}' + content + '{% end' + lang + ' %}' + end;
                    });
            }
        }, i);
        i++;
    }
}

/**
 * @typedef diagramHandler
 * @param args see hexo.extend.tag.register
 * @param diagType{string} supported diagrams
 * @param diagram{string} the diagram content
 * @param hexo
 */
function diagramHandler(args, diagType, diagram, hexo) {

}

const supportedDiagram = {
    kroki: {
        // see https://github.com/yuzutech/kroki.io/blob/master/index.html#L71
        // curl -fsSL https://kroki.io/health | jq -r '.version | del(.kroki) | keys[]' | tr '\n' '|' | sed 's/|plantuml/|puml|plantuml/g'
        matchRegexp: /(\s*)(```) *(actdiag|blockdiag|bpmn|bytefield|c4plantuml|ditaa|erd|excalidraw|graphviz|mermaid|nomnoml|nwdiag|packetdiag|pikchr|puml|plantuml|rackdiag|seqdiag|svgbob|umlet|vega|vegalite|wavedrom) *\n?([\s\S]+?)\s*(\2)(\n+|$)/g,
        //  curl https://kroki.io/health | jq -r '.version | del(.kroki) | keys'
        diagTypes: [
            "actdiag",
            "blockdiag",
            "bpmn",
            "bytefield",
            "c4plantuml",
            "ditaa",
            "erd",
            "excalidraw",
            "graphviz",
            "mermaid",
            "nomnoml",
            "nwdiag",
            "packetdiag",
            "pikchr",
            "plantuml",
            "rackdiag",
            "seqdiag",
            "svgbob",
            "umlet",
            "vega",
            "vegalite",
            "wavedrom"
        ]
    },
    plantuml: {
        matchRegexp: /(\s*)(```) *(puml|plantuml) *\n?([\s\S]+?)\s*(\2)(\n+|$)/g,
        diagTypes: [
            "plantuml"
        ]
    }
}

module.exports = {
    register: register,
    supportedDiagram: supportedDiagram,
    diagramHandler: diagramHandler
}
