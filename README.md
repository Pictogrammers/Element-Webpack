# Element Webpack Config

Shared webpack configuration for use with `@pictogrammers/element` package.

```javascript
const config = require('@pictogrammers/element-webpack');

module.exports = config({
    port: 3000,
    src: 'src',
    dist: 'dist',
    watch: [
        'src/**/*.md'
    ],
    before: (components, args, mode) => {
        console.log(`${components.length} Components`);
    },
    after: (components, args, mode) => {
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
        { from: 'src/styles.css', to: 'styles.css' },
    ]
    // Shorthand copy for the above
    // copy: [ 'src/styles.css' ]
});
```

## Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `port` | `3000` | localhost port |
| `src`  | `src`  | Source folder for components, `favicon.svg`, and `index.html` |
| `dist` | `dist` | Distribution folder. Defaults to `dist` |
| `watch` | `[]`  | Array of additional files to watch. Glob string format. |
| `copy` | `[]` | Copy over additional folders or files to the `dist` folder. |
| `before` | `null` | Run additional code after before every compilation. |
| `after` | `null` | Run additional code after every compilation. |