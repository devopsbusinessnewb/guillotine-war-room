# Sunday Funday IQ

Sunday Funday IQ is the umbrella project for the fantasy-football and
football-pool decision-support tools built for personal use.

## Project structure

``` text
Sunday Funday IQ/
├── README.md
├── apps/
│   ├── guillotine/
│   │   └── index.html
│   ├── pickem/
│   │   └── index.html
│   └── yahoo/
├── extensions/
│   └── cbs-pickem-bridge/
├── data/
│   └── samples/
└── docs/
```

## Canonical-file rule

The files inside this project are the source of truth.

Application entry files are always named `index.html`. Version/build
numbers belong inside the application, not in the canonical filename.

Downloaded development files such as `pickem_v0_2.html`, ZIP files,
exports, and other temporary artifacts are not authoritative after the
approved version has been placed into this project structure.

## Applications

### Guillotine

Location: `apps/guillotine/index.html`

Sleeper Guillotine league decision-support dashboard. The current
baseline is Sunday Funday IQ Build 2.7.

### CBS Pick'em

Location: `apps/pickem/index.html`

CBS confidence-pool decision-support application. Its primary objective
is weekly tournament performance, especially maximizing the chance of
finishing first or second.

Confidence weights are a core part of the pool strategy.

### Yahoo

Location: `apps/yahoo/`

Reserved for the future Yahoo fantasy-football module.

## Browser extensions

### CBS Pick'em Bridge

Location: `extensions/cbs-pickem-bridge/`

Local Chrome extension that reads data already delivered to the
authenticated CBS Pick'em browser session.

Its purpose is to provide CBS pool information to Pick'em IQ without
storing the user's CBS password.

The bridge currently supports capturing CBS page/GraphQL data and
exporting a JSON scan for import into Pick'em IQ.

Do not place passwords, browser cookies, authorization headers, session
tokens, or other credentials in the project.

## Data

Location: `data/samples/`

Contains sanitized sample/test data used to develop and verify
integrations.

Live exports downloaded during normal use can remain temporary unless a
sanitized example is intentionally promoted into this folder.

## Documentation

Location: `docs/`

Architecture notes, setup instructions, integration documentation, and
other project documentation belong here.

The root `README.md` remains the high-level project map.

## CBS Pick'em data flow

``` text
CBS Pick'em website
        ↓
Authenticated Chrome session
        ↓
CBS Pick'em Bridge
        ↓
CBS scan JSON
        ↓
Pick'em IQ
        ↓
Weekly picks + confidence-weight analysis
```

CBS public pick percentages represent pool ownership/field behavior.
They are not treated as an independent prediction of game outcomes.
Pick'em IQ should combine field ownership with an independent
probability signal, such as market-derived win probabilities, when
evaluating leverage.

## Development workflow

1.  Make changes to the appropriate module.
2.  Test the new build before replacing the canonical version.
3.  Once approved, replace the module's canonical file in this project.
4.  Keep the canonical filename stable (`index.html` for apps).
5.  Commit the organized project to GitHub.
6.  Do not use Downloads, phone copies, or randomly versioned files as
    the long-term source of truth.

## Repository direction

The GitHub repository should mirror this folder structure.

The project should ultimately use one repository for Sunday Funday IQ
rather than separate repositories for each module. The root application
can later become a Sunday Funday IQ home/launcher for Guillotine,
Pick'em, Yahoo, and future modules.
