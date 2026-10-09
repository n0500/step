# Teacher PIN recovery checks

Run the core checks with Node.js 22 or later:

```
node --test tests/teacher-pin-recovery.test.cjs
```

Install `jsdom` in a separate development directory and add that directory's
`node_modules` to `NODE_PATH` to run the DOM checks:

```
node --test tests/teacher-pin-recovery.dom.test.cjs
```

For the real Auth SDK check, install `firebase@10.12.5` and `firebase-tools`
in that same development directory. Configure the Auth emulator on
`127.0.0.1:9099`, disable the Emulator UI, then use `firebase emulators:exec`
with `--only auth --project demo-stepup-pin` to run:

```
node tests/teacher-pin-recovery.emulator.cjs
```

This check uses the official Auth SDK and emulator. Its Firestore test store
checks student ownership and restricts updates to `pin`, matching the existing
rules. It never contacts the production Firebase project. It verifies that the
old PIN stops working, the new PIN signs in with the same UID, the teacher's
default session stays active, and a failed profile write can be repaired.

## Unit 1 review checks

With `jsdom` on `NODE_PATH`, run:

```
node --test tests/unit1-review-flow.test.cjs
```

These checks load the real question bank and review scripts. They cover the book
passage, listening controls, answer feedback, duplicate taps, current-attempt
scores versus cumulative mastery, summary retries, the full decorated journey
screen, and preservation of historical answers and earned certificates. Firebase
is replaced by an isolated test store; no student accounts or production records
are changed.

## Unit 2 reading and listening checks

With `jsdom` on `NODE_PATH`, run:

```
node --test tests/unit2-review-media.test.cjs
```

These checks cover all Unit 2 reading and listening questions, direct and journey
entry points, reading evidence and listening replay on feedback, the decorated
student screen, and preservation of historical records and certificate question
requirements. Speech synthesis and Firebase use isolated test doubles; the tests
never access student accounts or production records.
