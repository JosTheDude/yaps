# Yet Another Portfolio Site

A simple static portfolio site by Jos.

Check it out here: https://jos.gg/

## Cloudflare Workers

This repo is configured to deploy as a static-assets Cloudflare Worker using [`workers.toml`](./workers.toml).

### Local development

```bash
loadnvm
bun install
bun run dev
```

### Deploy

```bash
loadnvm
bun run cf:whoami
bun run deploy
```

If `bun run cf:whoami` says you are not authenticated, run `wrangler login` first or set `CLOUDFLARE_API_TOKEN`.
