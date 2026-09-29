StepUp Unit 2 Source Update — 2026-09-28

Changes:
1. Unit 2 Class Mode / grammar training now prioritizes uploaded revision questions, then textbook questions.
2. Unit 2 journey grammar, vocabulary, reading, listening, and final challenge use revision/textbook-sourced content.
3. Unit 2 STEP Practice uses 8 STEP-compilation questions only.
4. Removed the disliked examples such as:
   - My father died ___ June 22.
   - While we were driving to Boston...
5. Added cache-busting and loads unit2-source-override.js after journey-engine.js.

Upload the ZIP as STEPUP_UPDATE.zip to the repository root; the existing workflow applies it automatically.


Additional student-journey skills:
- Vocabulary is explicit as the first Unit 2 mastery skill.
- Reading is now a STEP-style lesson using the Unit 2 textbook passage:
  main idea, detail, vocabulary in context, inference.
- Listening is now a STEP-style lesson using the Unit 2 textbook conversation:
  main idea, details, inference.
- Reading/Listening are textbook-based; only the dedicated STEP Practice uses STEP compilations.


Lighter student journey:
- Required core stops reduced from 4 to 3: Vocabulary, Grammar, Language Functions.
- Reading STEP-style: 3 questions.
- Listening STEP-style: 3 questions.
- STEP Practice: 5 random questions from the 8-question compilation bank.
- Final Challenge: 8 balanced questions.
- Expected total: about 31 questions minimum, up to about 37 if adaptive support appears.


Final Challenge revision:
- Removed the six literal repeats from earlier Unit 2 stations.
- Replaced them with six fresh questions based on the uploaded revision's job-application page.
- Kept one textbook Reading check and one textbook Listening check.
- Final Challenge remains 8 questions total.


Final Challenge — grammar + vocabulary only:
- 8 questions total.
- 6 grammar questions + 2 vocabulary questions.
- No Reading or Listening questions in the Final Challenge.
- Sources: uploaded revision first, then Unit 2 textbook for coverage and to avoid literal repeats.


Final Challenge — verified Unit 2 content:
- 8 questions total.
- 6 grammar questions + 2 vocabulary questions.
- All questions are confirmed as Unit 2 content.
- Removed the non-Unit-2 Fatima item and removed “let someone down”.
- Vocabulary kept: scientist and bored to death.


Class Mode:
- Unit 2 Class Mode is now STEP Grammar Practice.
- 8 questions total, one for each Unit 2 grammar target.
- All Class Mode questions come from STEP compilations.
- All questions have 4 answer choices.
- This does not change the lighter Student Journey content rules.


Edcafe per-class update:
- Student-facing MG1 Assistant is replaced by an Edcafe AI Tutor entry.
- Each class gets its own editable Edcafe URL in Teacher > Classes.
- The student AI Tutor button opens only that student's class link.
- "Explain my mistake" now opens the class Edcafe tutor.
- Existing StepUp journeys, Class Mode, Unit 2 updates, results, and Firebase data remain unchanged.


Unit 1 cleanup:
- Removed factual Historical events questions from the Unit 1 Vocabulary stop.
- Removed Historical comprehension questions from the Unit 1 Final Challenge.
- Replaced the three removed Final Challenge questions with existing Unit 1 language questions.
- Vocabulary mastery still has 3 questions.
- Grammar items that merely use past-time contexts remain because they assess grammar, not history recall.


Unit 2 Class Mode:
- Reading Review is now a separate Class Mode choice.
- STEP Grammar Practice remains separate.
- Teacher can choose which skill to review in Class Mode.
- Reading uses the Unit 2 JobPool textbook reading with 3 questions: Main Idea, Specific Detail, Inference.


Teacher-only Teach Reading:
- Added only to Teacher > Class Mode when Unit 2 is open.
- Unit 2 Class Mode now shows: Teach Reading / Reading Review / STEP Grammar Practice.
- Teach Reading is an 8-screen projector-friendly lesson: Warm-up, Vocabulary, two reading chunks, Main Idea strategy, and 3 guided questions.
- Student pages are unchanged; Teach Reading is not shown in the student navigation or journey.


Teach Reading enhancement:
- Teacher-only Read Aloud for Part 1, Part 2, and Full Reading.
- Pause/Resume, Stop, Listen Again, and 0.8x/0.9x/1x/1.1x speed controls.
- Sentence-by-sentence highlighting while reading.
- Vocabulary pronunciation buttons.
- Vocabulary meanings can be shown/hidden.
- Highlighted words inside the reading can be clicked to show/hide meaning.
- Added Quick Checks after both reading chunks.
- Added separate Main Idea, Scanning, and Inference strategy screens.
- Added Guided Practice for all three reading skills.
- Added Full Reading playback and a 3-question Exit Check.
- No Edcafe/AI usage is consumed by Read Aloud; it uses the device/browser speech engine.


Unit 2 original Reading text verification:
- Replaced the earlier condensed/paraphrased JobPool passage with the original Mega Goal 1 Student Book text (Reading pp. 26–27).
- Teach Reading now uses the full original About Us, Media Intern, Archaeological Interns, and Environmental Engineering text.
- Added Carl Barthes's original résumé as its own Teach Reading screen.
- Exit Check now uses statements from the textbook After Reading exercise.
- Reading Review also displays the original textbook passage rather than the condensed version.


Teach Reading paragraph sync fix:
- Reading text is now divided by textbook paragraph: About Us, Media Intern, Archaeological Interns, Environmental Engineering.
- Each paragraph has its own screen and its own Read Aloud control.
- Full Reading now reads paragraph-by-paragraph with unique paragraph/sentence identifiers.
- Sentence highlighting is synchronized with the exact paragraph being spoken.
- Résumé audio is also synchronized to the exact visible item being read.


Teach Reading clickable answer fix:
- Quick Check and Guided Practice answers can now be clicked.
- Selected answers are visibly highlighted.
- Check Answer is enabled after selecting an option.
- Correct and incorrect feedback appears after checking.
- Exit Check True/False choices are clickable and checked together.


Unit 2 textbook questions added:
- Before Reading task from Student Book p. 26 is shown with its exercise/page label.
- All six original After Reading True/False statements from Student Book p. 27 are included and clickable.
- All three original Discussion questions from Student Book p. 27 are included for oral class discussion.
- Reading paragraph, résumé, and full-reading screens now show the textbook exercise/page source.


Teach Reading strategy-flow improvement:
- Main Idea is now taught before the reading using Preview -> Predict.
- After Paragraph 1, students do a Main Idea prediction check.
- Scanning is taught immediately after the Media Intern paragraph, then applied in the next Quick Check.
- Scanning continues through the Archaeological and Engineering detail checks.
- Inference is taught after the job-opening paragraphs, before the résumé.
- Carl's résumé explicitly applies Scanning + Inference.
- Guided Practice later confirms Main Idea and reviews Scanning and Inference.
- Textbook After Reading remains before Full Reading, followed by textbook Discussion.


Student floating AI Tutor:
- Added a fixed floating AI Tutor button across the student experience.
- It appears only when the signed-in user role is student.
- It is removed/hidden for teachers, owners, and logged-out users.
- Tapping it opens the Edcafe tutor assigned to the student's own class.
- If the class has no Edcafe link, the existing clear message is shown.
- The existing AI Tutor tab remains unchanged.


Responsive iPad / laptop entry screen:
- The landing/login screen now expands automatically on tablets and laptops instead of staying at the narrow phone width.
- iPad/tablet width uses up to 940px; large laptops use up to 1080px.
- Role cards automatically fit 3 or 4 roles across the available width.
- Login fields use responsive columns on wider screens.
- Direct student class-link entry is wider on tablets/laptops too.
- Phone layout remains compact and unchanged.


Critical student progress save fix:
- Every student attempt is now normalized against the signed-in Firebase user profile before saving.
- studentId is forced to the real Firebase Auth UID.
- classId and teacherId are refreshed from the student's current Firestore profile before each save.
- This prevents Firestore rule rejection caused by stale/mismatched student class data.
- Attempt writes use a stable clientAttemptId to avoid duplicates during retries.
- Failed writes stay in a small local retry queue and retry after reconnect/sign-in.
- Students now see a visible “Progress saved ✓” confirmation.
- Journey result screens show whether the attempt was saved.
- Existing progress logic/mastery thresholds are not changed.


Critical progress save fix v2:
- Root cause found: v1 read a brand-new attempt document before creating it.
- Firestore rules reject reading a non-existent attempt document, so the save failed before CREATE.
- v2 removes that pre-read and creates the attempt directly.
- Student UID, classId, and teacherId are still refreshed from Firebase before saving.
- The obsolete v1 local queue is cleared; the existing student-flow-guard keeps the real pending result and Retry Save button.


Automatic student progress save:
- Students no longer need to press Retry Save.
- A failed Journey result is retried automatically after sign-in, when the page becomes active, and when the internet reconnects.
- Retries use a short backoff and continue automatically while a result is pending.
- The existing pending result is preserved on the device until Firebase confirms the save.
- On success, the pending warning disappears and the student sees Progress saved ✓.
- Manual Retry Save remains only as an underlying fallback from the existing flow guard.


Simplified direct progress saving:
- Removed progress-save-fix.js entirely.
- Removed student-auto-save.js entirely.
- Removed all pending-result / Retry Save wrappers from student-flow-guard.
- Student results now use the original direct save path in app.js again.
- Old temporary pending-save localStorage keys and warning UI are cleared automatically.
- Student login/profile recovery remains available.
