
[![version](https://img.shields.io/npm/v/hexo-filter-kroki.svg)](https://www.npmjs.com/package/hexo-filter-kroki)
[![download](https://img.shields.io/npm/dm/hexo-filter-kroki.svg)](https://www.npmjs.com/package/hexo-filter-kroki)


## Features

* Generate raw/base64/urlencoded svg at compile time, no external css and js required.
* Support free kroki.io service and self-managed service.

## How Does it work

Find diagram types quote with \`\`\`\<type\> , eg 
    
    ```plantuml
    your diagram
    ```

Send the diagram content to kroki.io
Return the generated images.

## Install

```sh
npm install --save hexo-filter-kroki
```

## Minimum configuration

By default no configuration is required, it will send your text to `kroki.io` for rendering, and the base64-encoded images will be inlined in the html.

## Advanced configuration

Please keep in mind, if you want more about privacy/safety, please replace with your own [self-managed](https://docs.kroki.io/kroki/setup/install/) render server.

```yaml
kroki:

  # the kroki free service server, you may switch to your self-hosted sever.
  server: "https://kroki.io/"
  # "inline": <svg>xxx<svg/>
  # "inlineUrlEncode": <img src='data:image/svg+xml;> 
  # "inlineBase64": <img src='data:image/svg+xml;base64> 
  # "localLink": <img src="/assert/puml/xxxx.svg">
  # "externalLink": <img src="http://www.plantuml.com/plantuml/svg/xxx">
  link: "inline"

  # common options: svg/png
  outputFormat: "svg"
```

## How to use it?

#### eg for actdiag

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

    ```wavedrom
    { signal: [
      { name: "clk",         wave: "p.....|..." },
      { name: "Data",        wave: "x.345x|=.x", data: ["head", "body", "tail", "data"] },
      { name: "Request",     wave: "0.1..0|1.0" },
      {},
      { name: "Acknowledge", wave: "1.....|01." }
    ]}
    ```
<img alt="kroki" src="https://kroki.io/actdiag/svg/eNpVTjkOwkAM7POK0fa8AEFDQUGNKBCFCdbKItmVjCFIKH9nj4Sj81yeodYuQh6vBhhUjLFYo43hwWr5lJ48N0nsKDDuN9ZizfjMHVZw-8S5QtX88aMcEpbgYfw0d1oWT_n349myIQ9Q6qtWjePcuNN4lalynvVNbyYmN8Di_4fxDQA-Q4A=">

and will get

<img alt="kroki" src="https://kroki.io/wavedrom/svg/eNqrVijOTM9LzLFSiOZSUKhWyEvMTbVSUErOyVbSUYCB8sQykGCBHgjUALGSQq0OsnKXxJJEhHqo8go9YxPTihpbvQqgVApQBdAOpYzUxBQgVykpP6USRJckZuaAaJC8UiyasUGphaWpxSVQk6HGGugZ6ukZ1BjqGcBcgarJMTk7L788JzUlPRWoEarJEOJ0A0OQ07liawGPW0Gr">


see more diagrams from 

* https://docs.kroki.io/kroki/diagrams-types/
* https://kroki.io/examples.html
