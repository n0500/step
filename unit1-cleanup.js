// StepUp • Unit 1 historical-question cleanup — 2026-09-28
(() => {
  "use strict";
  const J = window.STEPUP_JOURNEY;
  if (!J?.data) return;

  const data = J.data;
  const u1 = (data.units || []).find(u => u.id === "u1" || Number(u.number) === 1);
  if (!u1) return;

  const vocabMission = (u1.missions || []).find(m => m.id === "m1");
  if (vocabMission) {
    vocabMission.title = "Vocabulary";
    vocabMission.sub = "Vocabulary in context • Global issues";
  }

  // Remove factual history-recall questions only.
  data.questions = (data.questions || []).filter(q => !(
    q.unit_id === "MG1_U1" &&
    (q.skill === "Historical events" || q.skill === "Historical comprehension")
  ));

  // Keep 3 mastery questions in the Vocabulary stop using existing approved content.
  const hostQuestion = (data.questions || []).find(q => q.question_id === "U1-VOC-R01");
  if (hostQuestion) {
    hostQuestion.stage = "Mastery";
    hostQuestion.pool_id = "U1_VOC_MASTERY";
    hostQuestion.mastery_points = 1;
    hostQuestion.certificate_eligible = true;
    hostQuestion.next_if_correct = "update_mastery";
    hostQuestion.next_if_wrong = "update_mastery";
  }

  // Replace the 3 removed history questions in Final Challenge with existing
  // Unit 1 language questions from the current bank.
  const finalMission = "7. Big Changes Challenge";
  const replacements = [
    ["U1-PRS-M04", "U1-FIN-L01"],
    ["U1-PER-M05", "U1-FIN-L02"],
    ["U1-PPG-M04", "U1-FIN-L03"]
  ].map(([sourceId, newId]) => {
    const source = (data.questions || []).find(q => q.question_id === sourceId);
    if (!source) return null;
    return {
      ...source,
      question_id: newId,
      mission: finalMission,
      stage: "Final Challenge",
      difficulty: "متوسط",
      pool_id: "U1_FINAL",
      mastery_points: 1,
      attempt_limit: 1,
      certificate_eligible: true,
      next_if_correct: "finish_final",
      next_if_wrong: "finish_final"
    };
  }).filter(Boolean);

  const existingFinalIds = new Set(
    (data.questions || [])
      .filter(q => q.unit_id === "MG1_U1" && q.stage === "Final Challenge")
      .map(q => q.question_id)
  );

  replacements.forEach(q => {
    if (!existingFinalIds.has(q.question_id)) data.questions.push(q);
  });
})();
