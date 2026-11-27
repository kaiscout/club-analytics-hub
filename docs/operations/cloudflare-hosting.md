# Cloudflare hosting

The public dashboard (`clubanalytics.denizci.dev`) is a static build in `dist/`, served by a
Cloudflare Worker with static assets. A small
Worker script only redirects the retired hostname; there is no database or secret. Configuration lives in `wrangler.jsonc`.

## Automatic deploys

Cloudflare Workers Builds is connected to this repository. Every push to `main` runs
`npm run site:build` and then `npx wrangler deploy` on Cloudflare, and reports the
result as a check on the commit. Other branches are not built. The connection is managed
in the Cloudflare dashboard under the Worker's Settings → Builds.

## Commands

| Command                | What it does                                                           |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm run site:preview` | Builds `dist/` and serves it on loopback (Node, no Cloudflare runtime) |
| `npm run cf:dev`       | Builds `dist/` and serves it through Wrangler's local Workers runtime  |
| `npm run cf:deploy`    | Builds, runs the static-site checks, then uploads to Cloudflare        |

`cf:dev` needs the current Microsoft Visual C++ Redistributable on Windows; without it
the local runtime crashes with an access violation. `cf:deploy` does not depend on it.

## Account and domain

- Cloudflare account: the one whose `account_id` is set in `wrangler.jsonc`.
- `clubanalytics.denizci.dev` and the retired hostname are Worker Custom Domains. Cloudflare
  manages their DNS records and certificates.
- `worker/index.js` permanently redirects the retired hostname to the current one.
- The Worker name is an internal identifier tied to Workers Builds. Changing it requires
  reconnecting the repository in Cloudflare.
- `site/_headers` sets the content security policy, HSTS, `nosniff` and related headers. It allows Cloudflare Web
  Analytics, which is enabled for the zone and adds its own script.
- The `workers.dev` URL is disabled.
- Workers Builds deploys with the account's existing build token. If the GitHub repository is
  replaced or renamed, add it to the Cloudflare GitHub app's repository list, then reconnect it
  under the Worker's Settings → Builds with the same branch and commands.
