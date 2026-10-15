# Nexus Zero

**Nexus Zero** is a zero-storage, pure-math URL coordinate switchboard. It turns canonical URLs into case-insensitive English-word sequences and reverses them entirely in the browser.

> Map coordinates, but for links.

The project is inspired by [what3words](https://what3words.com/), which made geographic coordinates speakable, and Jorge Luis Borges’ *The Library of Babel*, an imagined library containing every possible book. Nexus Zero applies that addressable-space idea to the web: the words are not aliases stored in a database; the coordinate itself contains the reversible route.

Nexus Zero is an independent project and is not affiliated with what3words.

## Examples

| URL | Coordinate behavior |
| --- | --- |
| `https://siv19.dev` | `nexus` — one-word personal root |
| `https://linkedin.com/in/sivab193` | `beacon` — one-word personal profile |
| `https://github.com/sivab193/nexus-zero` | `forge.…` — personal GitHub realm |
| `https://example.com/path` | `globe.…` — `.com` realm with path |

## How it works

1. **Canonicalize** — remove transport prefixes, `www.`, empty root slashes, and known tracking parameters.
2. **Select a registry realm** — personal domains, platform templates, and official IANA suffixes each have a stable base slot.
3. **Pack the payload** — encode the remaining characters into one `BigInt` using the smallest compatible alphabet.
4. **Write base 4096** — express the integer as immutable dictionary words.
5. **Reverse the arithmetic** — Dial reconstructs the URL without querying a link database.

The first word selects one of 2,048 base registry slots. Its paired word 2,048 dictionary positions later represents the same realm in extended/path mode.

## Registry

- Personal slot `4`: `forge` → `github.com/sivab193/*`
- Personal slot `5`: `beacon` → `linkedin.com/in/sivab193`
- Platform slots include YouTube, Google Meet, GitHub, Spotify, arXiv, Wikipedia, and others.
- The current official IANA TLD catalog is assigned append-only starting at slot `150`.
- Unassigned slots remain explicitly reserved; published meanings must never move.

The **How it works** page exposes all 2,048 base slots with search, assigned/reserved/IANA filters, and progressive pagination.

## Run locally

Serve the directory over HTTP because ES modules and JSON fetches do not run from `file://`:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment plan

The recommended split preserves the product’s strongest property: resolving a coordinate never depends on a server.

### GitHub Pages — UI and codec

Deploy the repository root to GitHub Pages with the custom domain `nz.siv19.dev`:

- static HTML, CSS, JavaScript, dictionary, and registry;
- offline-capable encode/decode after the bundle is cached;
- `404.html` converts path coordinates into Dial requests;
- `CNAME` binds the Pages custom domain.

### Cloudflare Worker — optional learning signal only

A small Worker may accept privacy-preserving registry misses and expose aggregate counts to a scheduled registry-update workflow. It must never participate in normal Anchor or Dial resolution and must receive only an approved hostname/public prefix—never private IDs, full paths, or query strings.

Cloudflare Pages for everything would also work, but GitHub Pages is the simpler fit for this immutable static product. The Worker stays independently deployable when the self-learning pipeline is ready.

## Repository map

- `codec.js` — deterministic BigInt encoder and decoder
- `dictionary.json` — immutable 4,096-word dictionary
- `registry.json` — append-only 2,048-slot semantic registry
- `index.html`, `app.js`, `styles.css` — switchboard interface
- `how-it-works.html`, `explorer.js` — explainer and complete registry explorer
- `404.html` — GitHub Pages coordinate route catcher
- `scripts/generate-data.mjs` — reproducible dictionary/registry generator

## Stability rules

- Never reorder `dictionary.json` after publication.
- Never change the meaning of an assigned registry slot.
- Add new meanings only to reserved slots.
- Test every codec change with encode → decode round trips.
- Do not make core resolution depend on telemetry or network APIs.

## License

MIT — see [LICENSE](LICENSE).
