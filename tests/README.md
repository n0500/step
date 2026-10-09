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
