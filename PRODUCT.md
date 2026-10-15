# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS, and JavaScript deployed through GitHub Pages at `nz.siv19.dev`. No application database or server-side URL mapping is permitted.

## Users

People who want a memorable, speakable way to share or explore URLs, especially technical users who value deterministic, inspectable systems and links that remain resolvable offline.

## Product Purpose

Nexus Zero converts canonical URLs into case-insensitive English-word coordinates and deterministically converts those coordinates back into URLs. Success means users can anchor a URL, dial a coordinate, understand the transformation, and trust that no per-link record was stored.

## Positioning

Unlike a conventional URL shortener, Nexus Zero is a pure-math switchboard: semantic registry words select a URL realm, while the remaining payload is reversibly packed into immutable dictionary words without a mapping database.

## Operating Context

Users arrive to either Anchor a URL or Dial a coordinate. They may paste, type, speak, copy, share, or explore coordinates. Babel Dice supports procedural discovery, including locking the first registry word to a realm before re-rolling the payload.

## Capabilities and Constraints

- The word dictionary contains exactly 4,096 immutable lowercase entries.
- The registry contains 2,048 base slots, with the upper dictionary half representing path/extended modes.
- Encoding and decoding use `BigInt` and run entirely in the browser.
- Coordinate input is case-insensitive and accepts dots, hyphens, or whitespace as separators.
- Known personal domains, platform templates, TLDs, and public suffixes receive semantic trigger words.
- Reserved registry slots must produce a clear terminal notice rather than a fabricated destination.
- Canonicalization removes transport and tracking noise while preserving meaningful URL content.
- The site includes a main switchboard, route-catching 404 page, searchable explainer/registry view, immutable data files, and GitHub Pages CNAME.
- Inferred for implementation: the first release may ship a curated registry subset while preserving all 2,048 stable slot positions for append-only expansion.

## Brand Commitments

The product name is **Nexus Zero**. Its vocabulary is spatial and operational: Anchor, Dial, coordinate, registry, realm, switchboard, and Babel. The interface should make the mathematical mechanism tangible without pretending to be a conventional terminal.

## Evidence on Hand

The supplied architecture specification is the source of truth for product behavior and example coordinates. No testimonials, customer logos, benchmarks, or third-party endorsements were supplied and none should be fabricated.

## Product Principles

- Demonstrate the reversible math instead of asking users to trust a claim.
- Make the primary Anchor/Dial actions immediately usable.
- Keep every published coordinate stable through immutable dictionary order and append-only registry slots.
- Treat privacy as an architectural property: URL mappings are computed, not stored.
- Turn exploration into a safe, legible part of the product rather than an error state.

## Accessibility & Inclusion

The switchboard must be keyboard operable, readable at mobile and desktop sizes, and respect reduced-motion preferences. Status and error states must not rely on color alone.
