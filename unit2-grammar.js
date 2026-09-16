// StepUp — Unit 2 Grammar sourced-question pack — 2026-09-16
// Student-facing UI does not display source metadata. Provenance is retained here for audit only.
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
      subtitle: "STEP Sourced Grammar Practice",
      durationSeconds: 540,
      topics: [
        "Present Perfect Simple & Progressive",
        "Adjective + Preposition + Gerund",
        "Simple Present",
        "Prepositions of Time",
        "Relative Pronouns",
        "Past Progressive with While"
      ],
      questions: [
        {
          skill: "Present Perfect Progressive / Since",
          stem: "She has been working here ___ 2018.",
          choices: ["since", "for", "by", "in"],
          answer: 0,
          explanation: "2018 is a starting point, so use since.",
          need: "Use since with a starting point; use for with a duration.",
          sourceClass: "published_compilation",
          sourceLabel: "STEP KSA compilation / Stuvia",
          sourceAudit: "Previously preserved in the user's sourced STEP question deck."
        },
        {
          skill: "Present Perfect / For",
          stem: "Tom has lived in this town ___ three years.",
          choices: ["for", "since", "in"],
          answer: 0,
          explanation: "Three years is a duration, so use for.",
          need: "Ask whether the time expression is a duration (for) or a starting point (since).",
          sourceClass: "published_step_model",
          sourceLabel: "Injaz STEP model 7"
        },
        {
          skill: "Adjective + Preposition + Gerund",
          stem: "He is interested ___ learning English.",
          choices: ["in", "on", "at", "for"],
          answer: 0,
          explanation: "The fixed expression is interested in; a gerund can follow the preposition.",
          need: "Learn the chunk interested in + noun/verb-ing.",
          sourceClass: "public_repeat_recall",
          sourceLabel: "Alhmnii STEP channel — presented as a frequently repeated STEP item"
        },
        {
          skill: "Relative Pronouns",
          stem: "The mechanic ___ works on my car is very experienced.",
          choices: ["who", "when", "which", "is"],
          answer: 0,
          explanation: "Who introduces a relative clause referring to a person.",
          need: "Use who for a person; which for a thing; that can often refer to either in defining clauses.",
          sourceClass: "published_step_model",
          sourceLabel: "Injaz STEP model 4"
        },
        {
          skill: "Prepositions of Time",
          stem: "I met my friend ___ the afternoon.",
          choices: ["in", "on", "at"],
          answer: 0,
          explanation: "Use in with parts of the day: in the morning, afternoon, or evening.",
          need: "Time clue: in + part of the day; on + day/date; at + clock time/night.",
          sourceClass: "published_step_model",
          sourceLabel: "Injaz STEP model 4"
        },
        {
          skill: "Prepositions of Time",
          stem: "My father died ___ June 22.",
          choices: ["on", "at", "in"],
          answer: 0,
          explanation: "Use on with a specific date.",
          need: "Use on for days and dates.",
          sourceClass: "published_step_model",
          sourceLabel: "Injaz STEP model 7"
        },
        {
          skill: "Past Progressive with While",
          stem: "It ___ to rain while Tariq and I ___ to school.",
          choices: ["begin / was driving", "began / were driving", "began / drove", "begin / drive"],
          answer: 1,
          explanation: "The rain began as a past event while the driving action was already in progress.",
          need: "With while, look for the continuing action in was/were + verb-ing; a shorter event can use simple past.",
          sourceClass: "published_step_sample",
          sourceLabel: "Published STEP sample / test-q.com",
          sourceAudit: "Previously preserved in the user's sourced STEP question deck."
        },
        {
          skill: "Past Progressive with While",
          stem: "While we were driving to Boston yesterday, we ___ several accidents.",
          choices: ["were seeing", "have seen", "saw"],
          answer: 2,
          explanation: "Were driving gives the background action; saw is the completed event in that past context.",
          need: "Do not choose past progressive just because while appears; identify which action is background and which event happened.",
          sourceClass: "published_compilation",
          sourceLabel: "STEP grammar compilation / Scribd",
          sourceAudit: "Previously preserved in the user's sourced STEP question deck."
        },
        {
          skill: "Simple Present",
          stem: "Does Mohammed ___ that the final exam is tomorrow?",
          choices: ["know", "knowing", "is knowing"],
          answer: 0,
          explanation: "After does, use the base form: know.",
          need: "In present-simple questions, use does + subject + base verb.",
          sourceClass: "published_step_model",
          sourceLabel: "Injaz STEP model 7"
        }
      ]
    }
  ];
})();
