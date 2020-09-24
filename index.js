const krokiRender = require("./lib/krokiRender");


// add more puml diagTypes here
const replacement = /(\s*)(```) *(blockdiag|bpmn|seqdiag|actdiag|nwdiag|packetdiag|rackdiag|c4plantuml|ditaa|erd|graphviz|mermaid|nomnoml|puml|plantuml|svgbob|vega|vegalite|wavedrom) *\n?([\s\S]+?)\s*(\2)(\n+|$)/g;

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
    "vega",
    "vegalite",
    "wavedrom"
]

var i = 0;
for (let diagType of diagTypes) {
    hexo.extend.tag.register(diagType, (args, content) => {
        return krokiRender.serverSideRendering(Object.assign(krokiRender.config, hexo.config.kroki), diagType, content)
    }, {
        async: true,
        ends: true
    });

    hexo.extend.filter.register('before_post_render', (data) => {
        if ('.md'.indexOf(data.source.substring(data.source.lastIndexOf('.')).toLowerCase()) > -1) {
            data.content = data.content
                .replace(replacement, (raw, start, startQuote, lang, content, endQuote, end) => {
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
