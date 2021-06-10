const render = require("./lib/render");
const hexoWrapper = require("./lib/hexoWrapper");
const defaultConfig = 'kroki';

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
    server = server.replace(/\/$/, '')
    const pako = require('pako')
    const data = Buffer.from(diagram, 'utf8')
    const compressed = pako.deflate(data, {level: 9})
    var base64Str = Buffer.from(compressed).toString('base64');
    var newStr = render.urlSafe(base64Str, defaultConfig)
    return [server, diagramType, format, newStr].join('/');
}

hexoWrapper.register(
    defaultConfig,
    hexo,
    hexoWrapper.supportedDiagram[defaultConfig].matchRegexp,
    hexoWrapper.supportedDiagram[defaultConfig].diagTypes,
    (args, diagType, diagram, hexo) => {
        const mergedCfg = Object.assign(render.config, {
            server: "https://kroki.io",
            // the img generated will have a default class name.
            className: defaultConfig
        }, hexo.config[defaultConfig])
        diagram = render.decorateDiagram(mergedCfg, diagType, diagram);
        var realUrl = makeURL(mergedCfg.server, diagType, mergedCfg.outputFormat, diagram);
        return render.serverSideRendering(mergedCfg, realUrl)
    }
)