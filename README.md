# Black Friday Beacon

A static deal finder for Black Friday 2026: **75 real deals** across TVs, Laptops,
Audio, Home, Gaming, Smartwatches, Kitchen and Tablets. Every deal shows its
product, store, sale price, usual price, discount (computed from the two prices)
and a verdict — NEW LOW, STRONG DEAL or ROUTINE SALE — with a one-line note on
the evidence, the check time (27 Nov 2026, 13:20 WIB) and a link to the source
article that named the store and price.

Search, category, store and discount filters all work, plus sorting by biggest
discount, biggest dollars saved, lowest price or best verdict. Filter state is
readable from the URL hash, e.g. `#category=TVs&sort=discount`.

## Run locally

```sh
python3 -m http.server --directory app 8080
```

Then open http://localhost:8080/ in a browser. No build step, no network
requests — the site is plain static files under `app/`.

## Hand-in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with `buildDossier` from
`vendor/makefun-frontend.ts`.

Play code: `tnn5efeq`
