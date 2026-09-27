// StepUp — Unit 2 Class Mode = STEP grammar practice — 2026-09-28
// Class Mode uses STEP compilation questions only.
// Student Journey remains controlled separately in unit2-source-override.js.
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
      title: "Unit 2 • STEP Grammar Practice",
      subtitle: "STEP Compilation Questions",
      durationSeconds: 480,
      topics: [
        "Simple Present",
        "Present Perfect Progressive",
        "Past Progressive with While",
        "Relative Pronouns",
        "Adjective + Preposition + Gerund",
        "Present Perfect Simple",
        "Wh-Questions",
        "Prepositions of Time"
      ],
      questions: [
        {
          skill: "Simple Present",
          stem: "Our boss ______ important people every Tuesday.",
          choices: ["Meeting", "Was met", "Meets", "Is meet"],
          answer: 2,
          explanation: "Every Tuesday signals the simple present.",
          need: "Look for a repeated routine or habit.",
          sourceClass: "step_compilation",
          sourceLabel: "STEP compilation"
        },
        {
          skill: "Present Perfect Progressive",
          stem: "The students ______ a new way to process water for six months now.",
          choices: ["develop", "are developing", "have developed", "have been developing"],
          answer: 3,
          explanation: "For six months now emphasizes an ongoing activity.",
          need: "Duration + activity continuing until now → have/has been + verb-ing.",
          sourceClass: "step_compilation",
          sourceLabel: "STEP compilation"
        },
        {
          skill: "Past Progressive with While",
          stem: "I drank several cups of tea while I ______ this essay.",
          choices: ["have written", "wrote", "write", "was writing"],
          answer: 3,
          explanation: "The writing was the ongoing background action.",
          need: "While often introduces the continuing past action.",
          sourceClass: "step_compilation",
          sourceLabel: "STEP compilation"
        },
        {
          skill: "Relative Pronouns",
          stem: "The man ______ is standing next to the door is our teacher.",
          choices: ["which", "who", "whose", "whom"],
          answer: 1,
          explanation: "Who refers to a person as the subject of the relative clause.",
          need: "Person + subject of the relative clause → who.",
          sourceClass: "step_compilation",
          sourceLabel: "STEP compilation"
        },
        {
          skill: "Adjective + Preposition + Gerund",
          stem: "He is interested ______ learning English.",
          choices: ["in", "on", "at", "for"],
          answer: 0,
          explanation: "The fixed expression is interested in.",
          need: "Learn the chunk: interested in + noun/verb-ing.",
          sourceClass: "step_compilation",
          sourceLabel: "STEP compilation"
        },
        {
          skill: "Present Perfect Simple",
          stem: "I will not go on holiday until I ______ all my work.",
          choices: ["have completed", "will complete", "completed", "did complete"],
          answer: 0,
          explanation: "The present perfect shows completion before the future action.",
          need: "After until in this context, use a present form—not will.",
          sourceClass: "step_compilation",
          sourceLabel: "STEP compilation"
        },
        {
          skill: "Wh-Questions",
          stem: "I do not understand this sentence. What ______?",
          choices: ["does mean this word", "means this word", "does this word mean", "this word does mean"],
          answer: 2,
          explanation: "Use does + subject + base verb.",
          need: "Wh-word + does + subject + base verb.",
          sourceClass: "step_compilation",
          sourceLabel: "STEP compilation"
        },
        {
          skill: "Prepositions of Time",
          stem: "I usually study ______ night.",
          choices: ["in", "on", "at", "for"],
          answer: 2,
          explanation: "Use at with night: at night.",
          need: "at night",
          sourceClass: "step_compilation",
          sourceLabel: "STEP compilation"
        }
      ]
    }
  ];
})();
