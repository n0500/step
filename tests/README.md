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

## Unit 3 reading and listening checks

With `jsdom` on `NODE_PATH`, run:

```
node --test tests/unit3-review-media.test.cjs
```

These checks cover the five-paragraph Tulsa passage with all seven reading
questions, the complete graduation audioscript with all four listening questions,
direct entry points, replay and reading evidence on feedback, audio failures and
stale callbacks, the decorated student flow, historical answers, certificate
requirements, and delegation to Units 1 and 2. Speech synthesis and Firebase are
replaced by isolated test doubles; production records are never accessed.

## Teacher workspace checks

With `jsdom` on `NODE_PATH`, run:

```
node --test tests/teacher-workspace.test.cjs
```

These checks load the application and real question banks with an isolated,
read-only test store. They verify Arabic navigation, class-scoped counts and
rosters, student search, unit and activity filters, partial saved answers,
coverage versus cumulative accuracy, CSV export, student profiles, caching and
refresh, PIN access, certificate preservation for closed units, and compatibility
with the existing assistant, dictionary, teaching hub and class archive modules.
Browsing must not create, overwrite or delete student records. These are source
and DOM checks; they do not inspect a signed-in teacher account or browser layout.

## Unit 3 shared student reading lesson checks

With `jsdom` on `NODE_PATH`, run:

```
node --test tests/unit3-student-reading-lesson.test.cjs
```

These checks compare student and teacher lesson content, including all five
original paragraphs, vocabulary, comprehension questions, reading strategies,
and After Reading task numbers and page. They verify the student entry points,
audio replay and failure feedback, navigation after answer checking, progress
saved on the device for each student, reload and storage failures, unit access,
sign-out, existing practice resumption, and an answer still saving when the
lesson opens. The decorated student screen must retain historical answers,
certificate requirements and earned certificates. Learning the lesson itself
must never query or write production records or award unit mastery. Firebase
and speech synthesis are isolated test doubles; no real accounts are used.

## Unit 3 Class Mode grammar questions

With `jsdom` on `NODE_PATH`, run:

```
node --test tests/unit3-class-grammar-questions.test.cjs
```

These checks cover the two teacher-provided picture questions with complete
sentence choices, discussion before revealing correctness, explanations and
picture evidence, navigation, replay, the two-clue summary, and devices without
audio support. The uploaded source image is displayed through CSS viewports;
its pixels are unchanged. The student activity retains its original four
scenarios, saved answer identifiers and first-try scoring. Class Mode must not
write student records. The tests use DOM and audio doubles; no live accounts
or browser screenshots are involved.

## Journey skill status checks

With `jsdom` on `NODE_PATH`, run:

```
node --test tests/journey-skill-status.test.cjs
```

These checks load the real question banks and the full decorated student view.
They distinguish question coverage from latest-answer accuracy in Units 1–3,
including a single wrong answer above 80%, partial mistakes, revisiting skills,
newer cumulative summaries after an incorrect retake, and corrected retries.
Retake summaries and their celebration layer must show the actual current score,
while saved cumulative scores and timed STEP question counts stay unchanged.
Checks appear only for all-correct skills. Home, Journey cards and Progress must
use the same accuracy while earlier credits, certificate requirements, earned
certificates and STEP Ready badges remain intact. They also check future-unit
roadmap statuses and idle rendering. Firebase is an isolated test double; real
student accounts and production records are never accessed.
