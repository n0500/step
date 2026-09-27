// StepUp — Unit 2 Grammar source policy — 2026-09-28
// Priority: uploaded revision questions first, then Mega Goal 1 Unit 2 textbook.
// STEP compilations are reserved for the dedicated STEP Practice stop only.
(() => {
  const data = window.PROVEIT_DATA;
  if (!data || !Array.isArray(data.units)) return;
  const unit = data.units.find(u => u.id === "u2" || Number(u.number) === 2);
  if (!unit) return;

  unit.title = "Careers";
  unit.available = true;
  unit.trainings = [
    {
      id: "u2-grammar",
      type: "grammar",
      title: "Unit 2 Grammar",
      subtitle: "Revision + Textbook Practice",
      durationSeconds: 540,
      topics: [
        "Present Perfect Simple & Progressive",
        "Adjective + Preposition + Gerund",
        "Simple Present & Wh-Questions",
        "Prepositions of Time",
        "Relative Pronouns",
        "Past Progressive with While"
      ],
      questions: [
        {
          skill: "Adjective + Preposition + Gerund",
          stem: "I'm interested in ___ English.",
          choices: ["studied", "studies", "studying"],
          answer: 2,
          explanation: "After interested in, use the gerund: studying.",
          need: "interested in + verb-ing",
          sourceClass: "uploaded_revision",
          sourceLabel: "MG -1 - General revision (grammar), Q9"
        },
        {
          skill: "Prepositions of Time",
          stem: "He works ___ night.",
          choices: ["in", "on", "at"],
          answer: 2,
          explanation: "Use at with night: at night.",
          need: "at night",
          sourceClass: "uploaded_revision",
          sourceLabel: "MG -1 - General revision (grammar), Q36"
        },
        {
          skill: "Relative Pronouns",
          stem: "The new driver ___ started work yesterday is very quiet.",
          choices: ["who", "which", "where"],
          answer: 0,
          explanation: "Use who for a person.",
          need: "who = people",
          sourceClass: "uploaded_revision",
          sourceLabel: "MG -1 - General revision (grammar), Q37"
        },
        {
          skill: "Present Perfect Progressive",
          stem: "How long has he been ___ football?",
          choices: ["play", "playing", "plays"],
          answer: 1,
          explanation: "Present perfect progressive uses has been + verb-ing.",
          need: "has been + verb-ing",
          sourceClass: "uploaded_revision",
          sourceLabel: "MG -1 - General revision (grammar), Q38"
        },
        {
          skill: "Simple Present",
          stem: "He ___ his car every day.",
          choices: ["drive", "drives", "driving"],
          answer: 1,
          explanation: "With he in the simple present, use drives.",
          need: "he/she/it + verb-s",
          sourceClass: "uploaded_revision",
          sourceLabel: "MG -1 - General revision (grammar), Q39"
        },
        {
          skill: "Present Perfect Simple & Progressive",
          stem: "I ___ a job for three months, and I still ___ one.",
          choices: [
            "have been looking for / haven't found",
            "have looked for / haven't been finding"
          ],
          answer: 0,
          explanation: "The ongoing search takes the progressive; the result uses the simple form.",
          need: "duration/activity vs. completed result",
          sourceClass: "textbook",
          sourceLabel: "Mega Goal 1 Unit 2, Grammar B1"
        },
        {
          skill: "Present Perfect Simple",
          stem: "How many pages of that book ___?",
          choices: ["have you read", "have you been reading"],
          answer: 0,
          explanation: "How many asks about a completed amount, so use the present perfect simple.",
          need: "How many? → result/amount",
          sourceClass: "textbook",
          sourceLabel: "Mega Goal 1 Unit 2, Grammar B4"
        },
        {
          skill: "Wh-Questions / Simple Present",
          stem: "What ___ your uncle ___? He's a writer.",
          choices: ["does / do", "do / does", "is / do"],
          answer: 0,
          explanation: "Use does + subject + base verb: What does your uncle do?",
          need: "does + base verb",
          sourceClass: "textbook",
          sourceLabel: "Mega Goal 1 Unit 2, Form Meaning and Function A1"
        },
        {
          skill: "Past Progressive with While",
          stem: "It was raining ___ Yahya was washing the car.",
          choices: ["while", "since", "for"],
          answer: 0,
          explanation: "While connects two actions happening at the same time in the past.",
          need: "while + past progressive",
          sourceClass: "textbook",
          sourceLabel: "Mega Goal 1 Unit 2, Form Meaning and Function C example"
        }
      ]
    }
  ];
})();
