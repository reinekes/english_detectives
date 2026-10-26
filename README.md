# Baker Street — English Detective Club

A complete browser prototype: an original Sherlock-inspired mystery for learning English through evidence, questions and deduction.

## Run

```sh
npm start
```

Open http://127.0.0.1:4173/. Python 3 serves `dist/`; no installation or build step is needed. Use HTTP rather than opening `index.html` directly.

## Verify

```sh
npm test
```

16 focused tests cover the real case, evidence and deduction gates, correct and incorrect accusations, persistence and journal export.

## Play

Explore 3 locations, inspect 6 clues, question 4 suspects, make 3 deductions, and accuse someone with 3 supporting exhibits. English B1 text has opt-in Russian translation. Click underlined words to save vocabulary. Notes, words and progress stay in localStorage; export your investigation as Markdown.

`dist/case-data.js` contains the story in EN/RU; `engine.js` contains rules and persistence; `app.js` contains the interface. Sound is optional: generated rain and your browser's English voice. This prototype uses prepared dialogue, with no backend or LLM.

## Documents

- [Technical specification (RU)](docs/TECHNICAL_SPEC.md)
- [Implementation plan (RU)](docs/IMPLEMENTATION_PLAN.md)
- [Case design — spoilers](docs/CASE_DESIGN.md)
- [Development and verification log](docs/DEVELOPMENT_LOG.md)
- [Original artwork provenance](docs/ASSETS.md)

The hosting identity and static directory are preserved in `.openai/hosting.json`. New publication is private to the owner.
