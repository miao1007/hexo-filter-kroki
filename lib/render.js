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
    // append some text per diagram, used for the theme or else config
    insert: {
        // the line number, eg for puml: 1
        afterLine: 0,
        // the content to insert, eg for puml: !theme sketchy-outline
        content: ''
    },

    // the img generated will have a default class name.
    className: 'kroki',

    //hidden option
    public_dir: "public",
    asset_path: "assert",
}

/**
 * Hooked by hexo
 * @param pluginName {string} hexo-filter-<pluginName>
 * @param {PluginConfig} pluginConfig the merged config
 * @param hexo{Object} the hexo object, injected by framework.
 * @param matches {string} the regexp to capture diagram fragment
 * @param diagTypes {Array.<string>} supported diagrams
 * @param makeURLfn {function.<string,string,{('svg'|'png')},string>} the function used to generate request
 * @param decorateDiagramFn {function.<Object,string>} the function to wrap diagram fragment
 */
function register(pluginName, pluginConfig, hexo, matches, diagTypes, makeURLfn, decorateDiagramFn) {
    var i = 0;
    for (let diagType of diagTypes) {
        hexo.extend.tag.register(diagType, (args, diagram) => {
            const mergedCfg = Object.assign(config, pluginConfig, hexo.config[pluginName])
            diagram = decorateDiagramFn(mergedCfg, diagram);
            var realUrl = makeURLfn(mergedCfg.server, diagType, mergedCfg.outputFormat, diagram);
            return serverSideRendering(mergedCfg, realUrl)
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
                            resolve(buffer.toString().replace(/<svg(.*?)>/g, `<svg $1 class="${pluginConfig.className}">$2`))
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
    }
}


module.exports = {
    config: config,
    appendAfterLine: (str, line, toInsert) => {
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
    },
    register: register
}