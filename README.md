# Yet Another Portfolio Site

A portfolio site by Jos.

Check it out here: https://jos.gg/

## Cloudflare Workers

This repo is configured to deploy as a Cloudflare Worker using [`workers.toml`](./workers.toml).

### Local development

```bash
bun install
bun run dev
```

### Deploy

```bash
bun run wrangler secret put DISCORD_WEBHOOK
bun run cf:whoami
bun run deploy
```

This site is majority static except for the contact form which uses a CF Worker + Secret to handle form submissions through Discord Webhooks.