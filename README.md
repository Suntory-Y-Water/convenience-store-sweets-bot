ありがとうございます。

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "lib": ["ESNext"],
    "types": ["@cloudflare/workers-types", "@types/jest"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

```yml
name: Test

on: push

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v4
        with:
          version: 8
      - name: Install dependencies
        run: pnpm install
      - name: Run test
        run: pnpm run test
```
