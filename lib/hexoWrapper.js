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
function diagramHandler(args, diagType, diagram, hexo){

}



const supportedDiagram = {
    // see https://docs.kroki.io/kroki/setup/encode-diagram/
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
        ]
    },
    // see https://plantuml.com/en/text-encoding
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