# Element Webpack Config

Shared webpack configuration for use with `@pictogrammers/element` package.

```javascript
const config = require('@pictogrammers/element-webpack');

module.exports = config({
    port: 3000,
    dist: 'dist',
    watch: [
        'src/**/*.md'
    ],
    after: (components, mode) => {
        // Run after compilation
        // components = [
        //   {
        //     name,
        //     input,
        //     namespace,
        //     component
        //     examples: [
        //       { example, exampleInput },
        //       ...
        //     ]
        //   },
        //   ...
        // ]
        // mode = 'production' | 'development'
    },
    copy: [
        { from: "folder/", to: `folder/` },
    ]
});
```

## Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `port` | `3000` | localhost port |
| `dist` | `dist` | Distribution folder. Defaults to `dist` |
| `watch` | `[]`  | Array of additional files to watch. Glob string format. |
| `after` | `null` | Run additional code after every compilation. |
| `copy` | `[]` | Copy over additional folders or files to the `dist` folder. |