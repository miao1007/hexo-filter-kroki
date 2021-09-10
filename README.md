
[![version](https://img.shields.io/npm/v/hexo-filter-kroki.svg)](https://www.npmjs.com/package/hexo-filter-kroki)
[![download](https://img.shields.io/npm/dm/hexo-filter-kroki.svg)](https://www.npmjs.com/package/hexo-filter-kroki)


Using [Kroki.io](https://kroki.io/#how) to generate diagrams for hexo

## Features

* Generate raw/base64/urlencoded svg at compile time, no external css and js required.
* Support [free](https://kroki.io/#install) kroki.io and [self-managed](https://docs.kroki.io/kroki/setup/install/) service.

## How Does it work

First find diagram types quote with \`\`\`\<type\>  eg 
    
    ```plantuml
    your diagram
    ```

The plugin will parse the tag and send the diagram content to kroki.io.
Finally, the generated images will be returned.

## Install

```sh
npm install --save hexo-filter-kroki
```

## Minimum configuration

By default, no configuration is required, the plugin will send your text to `kroki.io` for rendering, and the base64-encoded images will be inlined in the html.

## Advanced configuration

Please keep in mind, if you want more about privacy/safety, please replace with your own [self-managed](https://docs.kroki.io/kroki/setup/install/) render server.

```yaml
kroki:

  # the kroki free service server, you may switch to your self-hosted sever.
  server: "https://kroki.io/"
  # Available values 
  # "inline": <svg>xxx<svg/>
  # "inlineUrlEncode": <img src='data:image/svg+xml;> 
  # "inlineBase64": <img src='data:image/svg+xml;base64> 
  # "localLink": <img src="/assert/puml/xxxx.svg">
  # "externalLink": <img src="https://kroki.io/plantuml/svg/xxx">
  link: "inline"

  # common options: svg/png
  outputFormat: "svg"
  # the generated img will have a default class name.
  className: 'kroki'

  # append some fragment per diagram, used for the theme or else config
  inserts:
    - diagram: plantuml
      after: 1
      # see https://plantuml.com/en/theme
      fragment: '!theme sketchy-outline'
    - diagram: mermaid
      after: 0
      # see https://mermaid-js.github.io/mermaid/#/theming
      fragment: "%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ff0000'}}}%%"
```

## How to use it?

#### eg for actdiag

Input the following text

    ​```actdiag
    actdiag {
      write -> convert -> image
    
      lane user {
        label = "User"
        write [label = "Writing text"];
        image [label = "Get diagram image"];
      }
      lane Kroki {
        convert [label = "Convert text to image"];
      }
    }
    ```

and will get

<img alt="kroki" src="https://kroki.io/actdiag/svg/eNpVTjkOwkAM7POK0fa8AEFDQUGNKBCFCdbKItmVjCFIKH9nj4Sj81yeodYuQh6vBhhUjLFYo43hwWr5lJ48N0nsKDDuN9ZizfjMHVZw-8S5QtX88aMcEpbgYfw0d1oWT_n349myIQ9Q6qtWjePcuNN4lalynvVNbyYmN8Di_4fxDQA-Q4A=">

#### eg for wavedrom

Input the following text

    ```wavedrom
    { signal: [
      { name: "clk",         wave: "p.....|..." },
      { name: "Data",        wave: "x.345x|=.x", data: ["head", "body", "tail", "data"] },
      { name: "Request",     wave: "0.1..0|1.0" },
      {},
      { name: "Acknowledge", wave: "1.....|01." }
    ]}
    ```

and will get

<img alt="kroki" src="https://kroki.io/wavedrom/svg/eNqrVijOTM9LzLFSiOZSUKhWyEvMTbVSUErOyVbSUYCB8sQykGCBHgjUALGSQq0OsnKXxJJEhHqo8go9YxPTihpbvQqgVApQBdAOpYzUxBQgVykpP6USRJckZuaAaJC8UiyasUGphaWpxSVQk6HGGugZ6ukZ1BjqGcBcgarJMTk7L788JzUlPRWoEarJEOJ0A0OQ07liawGPW0Gr">


#### More

See supported types from api

* https://kroki.io/health

See more diagram examples at 
* 
* https://kroki.io/examples.html
