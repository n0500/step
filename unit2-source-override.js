// StepUp — Unit 2 source enforcement — 2026-09-28
// Non-STEP content: uploaded revision first, then Mega Goal 1 Unit 2 textbook.
// STEP Practice: STEP compilations only.
(() => {
  const J = window.STEPUP_JOURNEY;
  if (!J || !J.data) return;
  const data = J.data;
  const unit = (data.units || []).find(u => u.id === "u2" || Number(u.number) === 2);
  if (!unit) return;

  // Keep the journey structure, but make Unit 2 content source-grounded.
  unit.reading = "JobPool Has the Job for You\n\nJobPool is a privately-owned career network with branches all over the world. Since its foundation in 2000, the company has constantly improved its users’ experience and has been growing globally.\n\nMedia Intern: Applicants need to find information quickly, summarize it clearly, be fluent in English, be good at using computers, and be friendly and outgoing. This is a paid summer internship.\n\nArchaeological Interns: Interns work on an archaeological dig. The work is hard and painstaking. This is an unpaid three-month internship, but lodging and meals are provided.\n\nEnvironmental Engineering: Applicants need to be able to read blueprints, have some knowledge of Arabic, and cope with high temperatures.\n\nCarl’s résumé lists computer expertise in word-processing and graphic programs.";
  unit.listening = "Yousef: So, Khaled, are you happy with your job at the TV station?\nKhaled: Yes, very happy. I enjoy being out there and talking to people.\nYousef: How long have you been working on TV?\nKhaled: I’ve been a reporter at this station for five years—since my internship.\nYousef: I’ve been working at the bank since I left high school. I was hoping to be a watch repairer, but my parents talked me out of it.\nKhaled: Well, I was going to be a dentist, but luckily I changed my mind.\nYousef: It’s time to move on and find something more challenging. I’m good at solving problems.";
  const m4 = (unit.missions || []).find(m => m.id === "m4");
  const m7 = (unit.missions || []).find(m => m.id === "m7");
  if (m4) {
    m4.title = "Careers & Functions";
    m4.sub = "Simple Present • Wh-Questions • Time • Relative Pronouns • While";
  }

  const sourcedQuestions = [{"question_id":"U2-V-D1","unit_id":"MG1_U2","mission":"1. Career Words","stage":"Diagnostic","skill":"Vocabulary","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG1 Revision 1st term 1447, Vocabulary","source_original_text":"The phrase “day after day” means ___.","prompt":"The phrase “day after day” means ___.","option_a_id":"opt_a","option_a_text":"same pattern","option_b_id":"opt_b","option_b_text":"very bored","option_c_id":"opt_c","option_c_text":"a positive event","option_d_id":"opt_d","option_d_text":"a new job","correct_option_id":"opt_a","explanation":"Day after day means following the same pattern repeatedly.","hint":"","pool_id":"U2-V","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-V-S1","unit_id":"MG1_U2","mission":"1. Career Words","stage":"Support 1","skill":"Vocabulary","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG1 Revision 1st term 1447, Vocabulary","source_original_text":"My friend wants to become a ___ and discover new things.","prompt":"My friend wants to become a ___ and discover new things.","option_a_id":"opt_a","option_a_text":"scientist","option_b_id":"opt_b","option_b_text":"flavor","option_c_id":"opt_c","option_c_text":"clay","option_d_id":"opt_d","option_d_text":"driver","correct_option_id":"opt_a","explanation":"Scientist is the career word that fits the sentence.","hint":"","pool_id":"U2-V","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-V-R1","unit_id":"MG1_U2","mission":"1. Career Words","stage":"Reinforcement","skill":"Real Talk","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG1 Revision 1st term 1447, Vocabulary","source_original_text":"The phrase “bored to death” means ___.","prompt":"The phrase “bored to death” means ___.","option_a_id":"opt_a","option_a_text":"very bored","option_b_id":"opt_b","option_b_text":"very excited","option_c_id":"opt_c","option_c_text":"very busy","option_d_id":"opt_d","option_d_text":"very lucky","correct_option_id":"opt_a","explanation":"Bored to death means very bored.","hint":"","pool_id":"U2-V","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-V-M1","unit_id":"MG1_U2","mission":"1. Career Words","stage":"Mastery","skill":"Real Talk","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG1 Revision 1st term 1447, Vocabulary","source_original_text":"The expression “stuck in” means ___.","prompt":"The expression “stuck in” means ___.","option_a_id":"opt_a","option_a_text":"unable to move","option_b_id":"opt_b","option_b_text":"ready to travel","option_c_id":"opt_c","option_c_text":"easy to change","option_d_id":"opt_d","option_d_text":"happy to work","correct_option_id":"opt_a","explanation":"Stuck in means unable to move or get out.","hint":"","pool_id":"U2-V","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-V-M2","unit_id":"MG1_U2","mission":"1. Career Words","stage":"Mastery","skill":"Real Talk","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Conversation — Real Talk","source_original_text":"“Talk someone out of it” means ___.","prompt":"“Talk someone out of it” means ___.","option_a_id":"opt_a","option_a_text":"convince someone to do something different","option_b_id":"opt_b","option_b_text":"ask someone to speak louder","option_c_id":"opt_c","option_c_text":"offer someone a job","option_d_id":"opt_d","option_d_text":"work with someone","correct_option_id":"opt_a","explanation":"In the Unit 2 conversation, the expression means convincing someone to choose differently.","hint":"","pool_id":"U2-V","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-V-M3","unit_id":"MG1_U2","mission":"1. Career Words","stage":"Mastery","skill":"Real Talk","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Conversation — Real Talk","source_original_text":"In the Unit 2 conversation, “luckily” is used to show that an event was ___.","prompt":"In the Unit 2 conversation, “luckily” is used to show that an event was ___.","option_a_id":"opt_a","option_a_text":"positive","option_b_id":"opt_b","option_b_text":"boring","option_c_id":"opt_c","option_c_text":"impossible","option_d_id":"opt_d","option_d_text":"unfinished","correct_option_id":"opt_a","explanation":"The Real Talk box explains luckily as giving an opinion that an event was positive.","hint":"","pool_id":"U2-V","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-A-D1","unit_id":"MG1_U2","mission":"2. Experience: Result or Duration?","stage":"Diagnostic","skill":"Present Perfect Progressive","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q38","source_original_text":"How long has he been ___ football?","prompt":"How long has he been ___ football?","option_a_id":"opt_a","option_a_text":"play","option_b_id":"opt_b","option_b_text":"playing","option_c_id":"opt_c","option_c_text":"plays","option_d_id":"opt_d","option_d_text":"played","correct_option_id":"opt_b","explanation":"Use has been + verb-ing.","hint":"","pool_id":"U2-A","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-A-S1","unit_id":"MG1_U2","mission":"2. Experience: Result or Duration?","stage":"Support 1","skill":"Present Perfect Simple & Progressive","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar B1","source_original_text":"I ___ a job for three months, and I still ___ one.","prompt":"I ___ a job for three months, and I still ___ one.","option_a_id":"opt_a","option_a_text":"have been looking for / haven't found","option_b_id":"opt_b","option_b_text":"have looked for / haven't been finding","option_c_id":"opt_c","option_c_text":"look / don't find","option_d_id":"opt_d","option_d_text":"am looking for / didn't find","correct_option_id":"opt_a","explanation":"The ongoing activity uses the progressive; the result uses the simple form.","hint":"","pool_id":"U2-A","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-A-R1","unit_id":"MG1_U2","mission":"2. Experience: Result or Duration?","stage":"Reinforcement","skill":"Present Perfect Simple","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar B4","source_original_text":"How many pages of that book ___?","prompt":"How many pages of that book ___?","option_a_id":"opt_a","option_a_text":"have you read","option_b_id":"opt_b","option_b_text":"have you been reading","option_c_id":"opt_c","option_c_text":"did you reading","option_d_id":"opt_d","option_d_text":"are you read","correct_option_id":"opt_a","explanation":"How many asks about the completed amount.","hint":"","pool_id":"U2-A","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-A-M1","unit_id":"MG1_U2","mission":"2. Experience: Result or Duration?","stage":"Mastery","skill":"Present Perfect Simple","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar B2","source_original_text":"My father ___ at many different jobs during his career.","prompt":"My father ___ at many different jobs during his career.","option_a_id":"opt_a","option_a_text":"has worked","option_b_id":"opt_b","option_b_text":"has been working","option_c_id":"opt_c","option_c_text":"is working","option_d_id":"opt_d","option_d_text":"works now","correct_option_id":"opt_a","explanation":"The sentence focuses on different completed job experiences.","hint":"","pool_id":"U2-A","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-A-M2","unit_id":"MG1_U2","mission":"2. Experience: Result or Duration?","stage":"Mastery","skill":"Present Perfect Simple & Progressive","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar B3","source_original_text":"Adnan ___ books for years, but he ___ an award yet.","prompt":"Adnan ___ books for years, but he ___ an award yet.","option_a_id":"opt_a","option_a_text":"has been writing / hasn't received","option_b_id":"opt_b","option_b_text":"has written / hasn't been receiving","option_c_id":"opt_c","option_c_text":"writes / doesn't receive","option_d_id":"opt_d","option_d_text":"was writing / didn't receive","correct_option_id":"opt_a","explanation":"The continuing activity is writing; the result is receiving an award.","hint":"","pool_id":"U2-A","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-A-M3","unit_id":"MG1_U2","mission":"2. Experience: Result or Duration?","stage":"Mastery","skill":"Present Perfect Progressive","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar example","source_original_text":"Saeed ___ football since he was ten.","prompt":"Saeed ___ football since he was ten.","option_a_id":"opt_a","option_a_text":"has been playing","option_b_id":"opt_b","option_b_text":"has played now","option_c_id":"opt_c","option_c_text":"is playing since","option_d_id":"opt_d","option_d_text":"played","correct_option_id":"opt_a","explanation":"The book example focuses on an activity continuing over time.","hint":"","pool_id":"U2-A","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-B-D1","unit_id":"MG1_U2","mission":"3. Good at What?","stage":"Diagnostic","skill":"Adjective + Preposition + Gerund","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q9","source_original_text":"I'm interested in ___ English.","prompt":"I'm interested in ___ English.","option_a_id":"opt_a","option_a_text":"studied","option_b_id":"opt_b","option_b_text":"studies","option_c_id":"opt_c","option_c_text":"studying","option_d_id":"opt_d","option_d_text":"study","correct_option_id":"opt_c","explanation":"After interested in, use the gerund.","hint":"","pool_id":"U2-B","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-B-S1","unit_id":"MG1_U2","mission":"3. Good at What?","stage":"Support 1","skill":"Good at + Gerund","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar — Good at","source_original_text":"He's good at ___ computers.","prompt":"He's good at ___ computers.","option_a_id":"opt_a","option_a_text":"using","option_b_id":"opt_b","option_b_text":"use","option_c_id":"opt_c","option_c_text":"to use","option_d_id":"opt_d","option_d_text":"used","correct_option_id":"opt_a","explanation":"After good at, use verb-ing.","hint":"","pool_id":"U2-B","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-B-R1","unit_id":"MG1_U2","mission":"3. Good at What?","stage":"Reinforcement","skill":"Interested in + Gerund","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar — Interested in","source_original_text":"They're interested in ___ outdoors.","prompt":"They're interested in ___ outdoors.","option_a_id":"opt_a","option_a_text":"working","option_b_id":"opt_b","option_b_text":"work","option_c_id":"opt_c","option_c_text":"to work","option_d_id":"opt_d","option_d_text":"worked","correct_option_id":"opt_a","explanation":"After interested in, use verb-ing.","hint":"","pool_id":"U2-B","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-B-M1","unit_id":"MG1_U2","mission":"3. Good at What?","stage":"Mastery","skill":"Good at + Gerund","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar — Good at","source_original_text":"I'm not very good at ___ in public.","prompt":"I'm not very good at ___ in public.","option_a_id":"opt_a","option_a_text":"speaking","option_b_id":"opt_b","option_b_text":"speak","option_c_id":"opt_c","option_c_text":"to speak","option_d_id":"opt_d","option_d_text":"spoke","correct_option_id":"opt_a","explanation":"Good at is followed by a gerund.","hint":"","pool_id":"U2-B","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-B-M2","unit_id":"MG1_U2","mission":"3. Good at What?","stage":"Mastery","skill":"Interested in + Gerund","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar — Interested in","source_original_text":"She's not interested in ___ in the computer industry.","prompt":"She's not interested in ___ in the computer industry.","option_a_id":"opt_a","option_a_text":"working","option_b_id":"opt_b","option_b_text":"work","option_c_id":"opt_c","option_c_text":"to work","option_d_id":"opt_d","option_d_text":"worked","correct_option_id":"opt_a","explanation":"Interested in is followed by a gerund.","hint":"","pool_id":"U2-B","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-B-M3","unit_id":"MG1_U2","mission":"3. Good at What?","stage":"Mastery","skill":"Good at + Gerund","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar D example","source_original_text":"Hakim is good at ___ pictures.","prompt":"Hakim is good at ___ pictures.","option_a_id":"opt_a","option_a_text":"taking","option_b_id":"opt_b","option_b_text":"take","option_c_id":"opt_c","option_c_text":"to take","option_d_id":"opt_d","option_d_text":"took","correct_option_id":"opt_a","explanation":"The Unit 2 model sentence uses good at taking pictures.","hint":"","pool_id":"U2-B","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-C-D1","unit_id":"MG1_U2","mission":"4. Careers & People","stage":"Diagnostic","skill":"Simple Present","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q39","source_original_text":"He ___ his car every day.","prompt":"He ___ his car every day.","option_a_id":"opt_a","option_a_text":"drive","option_b_id":"opt_b","option_b_text":"drives","option_c_id":"opt_c","option_c_text":"driving","option_d_id":"opt_d","option_d_text":"drove","correct_option_id":"opt_b","explanation":"With he in the simple present, use drives.","hint":"","pool_id":"U2-C","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-C-S1","unit_id":"MG1_U2","mission":"4. Careers & People","stage":"Support 1","skill":"Prepositions of Time","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q36","source_original_text":"He works ___ night.","prompt":"He works ___ night.","option_a_id":"opt_a","option_a_text":"in","option_b_id":"opt_b","option_b_text":"on","option_c_id":"opt_c","option_c_text":"at","option_d_id":"opt_d","option_d_text":"for","correct_option_id":"opt_c","explanation":"Use at night.","hint":"","pool_id":"U2-C","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-C-R1","unit_id":"MG1_U2","mission":"4. Careers & People","stage":"Reinforcement","skill":"Relative Pronouns","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q37","source_original_text":"The new driver ___ started work yesterday is very quiet.","prompt":"The new driver ___ started work yesterday is very quiet.","option_a_id":"opt_a","option_a_text":"who","option_b_id":"opt_b","option_b_text":"which","option_c_id":"opt_c","option_c_text":"where","option_d_id":"opt_d","option_d_text":"when","correct_option_id":"opt_a","explanation":"Use who for a person.","hint":"","pool_id":"U2-C","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-C-M1","unit_id":"MG1_U2","mission":"4. Careers & People","stage":"Mastery","skill":"Wh-Questions / Simple Present","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Form Meaning and Function A1","source_original_text":"What ___ your uncle ___? He's a writer.","prompt":"What ___ your uncle ___? He's a writer.","option_a_id":"opt_a","option_a_text":"does / do","option_b_id":"opt_b","option_b_text":"do / does","option_c_id":"opt_c","option_c_text":"is / do","option_d_id":"opt_d","option_d_text":"does / does","correct_option_id":"opt_a","explanation":"Use does + subject + base verb.","hint":"","pool_id":"U2-C","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-C-M2","unit_id":"MG1_U2","mission":"4. Careers & People","stage":"Mastery","skill":"Relative Pronouns","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Form Meaning and Function B2","source_original_text":"The products ___ they launched this week are selling well.","prompt":"The products ___ they launched this week are selling well.","option_a_id":"opt_a","option_a_text":"that","option_b_id":"opt_b","option_b_text":"who","option_c_id":"opt_c","option_c_text":"where","option_d_id":"opt_d","option_d_text":"when","correct_option_id":"opt_a","explanation":"Use that for things in this defining relative clause.","hint":"","pool_id":"U2-C","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-C-M3","unit_id":"MG1_U2","mission":"4. Careers & People","stage":"Mastery","skill":"Past Progressive with While","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Form Meaning and Function C example","source_original_text":"It was raining ___ Yahya was washing the car.","prompt":"It was raining ___ Yahya was washing the car.","option_a_id":"opt_a","option_a_text":"while","option_b_id":"opt_b","option_b_text":"since","option_c_id":"opt_c","option_c_text":"for","option_d_id":"opt_d","option_d_text":"until","correct_option_id":"opt_a","explanation":"While connects actions happening at the same time in the past.","hint":"","pool_id":"U2-C","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-READ-M1","unit_id":"MG1_U2","mission":"5. Reading Career Paths","stage":"Mastery","skill":"Reading comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Reading — After Reading 1","source_original_text":"JobPool has been growing since the year 2000.","prompt":"JobPool has been growing since the year 2000.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_a","explanation":"The reading states that JobPool has been growing globally since its foundation in 2000.","hint":"","pool_id":"U2-READ","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-READ-M2","unit_id":"MG1_U2","mission":"5. Reading Career Paths","stage":"Mastery","skill":"Reading comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Reading — After Reading 2","source_original_text":"The archaeological interns get a good salary.","prompt":"The archaeological interns get a good salary.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_b","explanation":"The archaeological internship is unpaid.","hint":"","pool_id":"U2-READ","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-READ-M3","unit_id":"MG1_U2","mission":"5. Reading Career Paths","stage":"Mastery","skill":"Reading comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Reading — After Reading 4","source_original_text":"The candidate for the engineering job must be good at reading blueprints.","prompt":"The candidate for the engineering job must be good at reading blueprints.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_a","explanation":"The engineering opening requires the ability to read blueprints.","hint":"","pool_id":"U2-READ","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-READ-M4","unit_id":"MG1_U2","mission":"5. Reading Career Paths","stage":"Mastery","skill":"Reading comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Reading — After Reading 5","source_original_text":"Carl has experience with word-processing programs.","prompt":"Carl has experience with word-processing programs.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_a","explanation":"Carl's résumé lists computer expertise in word-processing and graphic programs.","hint":"","pool_id":"U2-READ","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-LST-M1","unit_id":"MG1_U2","mission":"6. Listening at Work","stage":"Mastery","skill":"Listening comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Conversation — About the Conversation 1","source_original_text":"Khaled has been working on TV for five years.","prompt":"Khaled has been working on TV for five years.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_a","explanation":"Khaled says he has been a reporter at the station for five years.","hint":"","pool_id":"U2-LST","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-LST-M2","unit_id":"MG1_U2","mission":"6. Listening at Work","stage":"Mastery","skill":"Listening comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Conversation — About the Conversation 2","source_original_text":"Khaled wanted to be an engineer.","prompt":"Khaled wanted to be an engineer.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_b","explanation":"He says he was going to be a dentist.","hint":"","pool_id":"U2-LST","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-LST-M3","unit_id":"MG1_U2","mission":"6. Listening at Work","stage":"Mastery","skill":"Listening comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Conversation — About the Conversation 3","source_original_text":"Yousef has had several jobs since he left high school.","prompt":"Yousef has had several jobs since he left high school.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_b","explanation":"He says he has been working at the bank since he left high school.","hint":"","pool_id":"U2-LST","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-LST-M4","unit_id":"MG1_U2","mission":"6. Listening at Work","stage":"Mastery","skill":"Listening comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Conversation — About the Conversation 4","source_original_text":"Yousef wanted to be a watch repairer.","prompt":"Yousef wanted to be a watch repairer.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_a","explanation":"Yousef says he was hoping to be a watch repairer.","hint":"","pool_id":"U2-LST","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-01","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Vocabulary","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG1 Revision 1st term 1447","source_original_text":"The phrase “day after day” means ___.","prompt":"The phrase “day after day” means ___.","option_a_id":"opt_a","option_a_text":"same pattern","option_b_id":"opt_b","option_b_text":"very bored","option_c_id":"opt_c","option_c_text":"a positive event","option_d_id":"opt_d","option_d_text":"a new job","correct_option_id":"opt_a","explanation":"Day after day means the same repeated pattern.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-02","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Present Perfect Progressive","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q38","source_original_text":"How long has he been ___ football?","prompt":"How long has he been ___ football?","option_a_id":"opt_a","option_a_text":"play","option_b_id":"opt_b","option_b_text":"playing","option_c_id":"opt_c","option_c_text":"plays","option_d_id":"opt_d","option_d_text":"played","correct_option_id":"opt_b","explanation":"Use has been + verb-ing.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-03","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Adjective + Preposition + Gerund","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q9","source_original_text":"I'm interested in ___ English.","prompt":"I'm interested in ___ English.","option_a_id":"opt_a","option_a_text":"studied","option_b_id":"opt_b","option_b_text":"studies","option_c_id":"opt_c","option_c_text":"studying","option_d_id":"opt_d","option_d_text":"study","correct_option_id":"opt_c","explanation":"Interested in is followed by verb-ing.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-04","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Prepositions of Time","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q36","source_original_text":"He works ___ night.","prompt":"He works ___ night.","option_a_id":"opt_a","option_a_text":"in","option_b_id":"opt_b","option_b_text":"on","option_c_id":"opt_c","option_c_text":"at","option_d_id":"opt_d","option_d_text":"for","correct_option_id":"opt_c","explanation":"Use at night.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-05","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Relative Pronouns","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q37","source_original_text":"The new driver ___ started work yesterday is very quiet.","prompt":"The new driver ___ started work yesterday is very quiet.","option_a_id":"opt_a","option_a_text":"who","option_b_id":"opt_b","option_b_text":"which","option_c_id":"opt_c","option_c_text":"where","option_d_id":"opt_d","option_d_text":"when","correct_option_id":"opt_a","explanation":"Use who for a person.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-06","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Simple Present","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Uploaded revision","source_ref":"MG -1 - General revision (grammar), Q39","source_original_text":"He ___ his car every day.","prompt":"He ___ his car every day.","option_a_id":"opt_a","option_a_text":"drive","option_b_id":"opt_b","option_b_text":"drives","option_c_id":"opt_c","option_c_text":"driving","option_d_id":"opt_d","option_d_text":"drove","correct_option_id":"opt_b","explanation":"Use drives with he.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-07","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Present Perfect Simple","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar B4","source_original_text":"How many pages of that book ___?","prompt":"How many pages of that book ___?","option_a_id":"opt_a","option_a_text":"have you read","option_b_id":"opt_b","option_b_text":"have you been reading","option_c_id":"opt_c","option_c_text":"did you reading","option_d_id":"opt_d","option_d_text":"are you read","correct_option_id":"opt_a","explanation":"How many asks about a completed amount.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-08","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Wh-Questions","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, FMF A1","source_original_text":"What ___ your uncle ___? He's a writer.","prompt":"What ___ your uncle ___? He's a writer.","option_a_id":"opt_a","option_a_text":"does / do","option_b_id":"opt_b","option_b_text":"do / does","option_c_id":"opt_c","option_c_text":"is / do","option_d_id":"opt_d","option_d_text":"does / does","correct_option_id":"opt_a","explanation":"Use does + base verb.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-09","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Past Progressive with While","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, FMF C example","source_original_text":"It was raining ___ Yahya was washing the car.","prompt":"It was raining ___ Yahya was washing the car.","option_a_id":"opt_a","option_a_text":"while","option_b_id":"opt_b","option_b_text":"since","option_c_id":"opt_c","option_c_text":"for","option_d_id":"opt_d","option_d_text":"until","correct_option_id":"opt_a","explanation":"Use while for simultaneous past actions.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-10","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Reading comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Reading — After Reading 2","source_original_text":"The archaeological interns get a good salary.","prompt":"The archaeological interns get a good salary.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_b","explanation":"The internship is unpaid.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-11","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Listening comprehension","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Conversation — About the Conversation 1","source_original_text":"Khaled has been working on TV for five years.","prompt":"Khaled has been working on TV for five years.","option_a_id":"opt_a","option_a_text":"True","option_b_id":"opt_b","option_b_text":"False","option_c_id":"opt_c","option_c_text":"Not stated","option_d_id":"opt_d","option_d_text":"Cannot tell","correct_option_id":"opt_a","explanation":"Khaled says he has been a reporter there for five years.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-FIN-12","unit_id":"MG1_U2","mission":"7. Careers Challenge","stage":"Final Challenge","skill":"Good at + Gerund","difficulty":"متوسط","question_type":"multiple_choice","source_type":"Textbook","source_ref":"Mega Goal 1 Unit 2, Grammar","source_original_text":"He's good at ___ computers.","prompt":"He's good at ___ computers.","option_a_id":"opt_a","option_a_text":"using","option_b_id":"opt_b","option_b_text":"use","option_c_id":"opt_c","option_c_text":"to use","option_d_id":"opt_d","option_d_text":"used","correct_option_id":"opt_a","explanation":"Good at is followed by verb-ing.","hint":"","pool_id":"U2-FIN","mastery_points":1,"attempt_limit":2,"certificate_eligible":true,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-STEP-01","unit_id":"MG1_U2","mission":"STEP Practice","stage":"STEP Practice","skill":"Simple Present","difficulty":"متوسط","question_type":"multiple_choice","source_type":"STEP compilation","source_ref":"NajmSA STEP compilation","source_original_text":"Our boss ______ important people every Tuesday.","prompt":"Our boss ______ important people every Tuesday.","option_a_id":"opt_a","option_a_text":"Meeting","option_b_id":"opt_b","option_b_text":"Was met","option_c_id":"opt_c","option_c_text":"Meets","option_d_id":"opt_d","option_d_text":"Is meet","correct_option_id":"opt_c","explanation":"Every Tuesday signals the simple present.","hint":"","pool_id":"U2-STEP","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-STEP-02","unit_id":"MG1_U2","mission":"STEP Practice","stage":"STEP Practice","skill":"Present Perfect Progressive","difficulty":"متوسط","question_type":"multiple_choice","source_type":"STEP compilation","source_ref":"STEPP2022S compilation","source_original_text":"The students ______ a new way to process water for six months now.","prompt":"The students ______ a new way to process water for six months now.","option_a_id":"opt_a","option_a_text":"develop","option_b_id":"opt_b","option_b_text":"are developing","option_c_id":"opt_c","option_c_text":"have developed","option_d_id":"opt_d","option_d_text":"have been developing","correct_option_id":"opt_d","explanation":"For six months now emphasizes an ongoing activity.","hint":"","pool_id":"U2-STEP","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-STEP-03","unit_id":"MG1_U2","mission":"STEP Practice","stage":"STEP Practice","skill":"Past Progressive with While","difficulty":"متوسط","question_type":"multiple_choice","source_type":"STEP compilation","source_ref":"STEP grammar compilation","source_original_text":"I drank several cups of tea while I ______ this essay.","prompt":"I drank several cups of tea while I ______ this essay.","option_a_id":"opt_a","option_a_text":"have written","option_b_id":"opt_b","option_b_text":"wrote","option_c_id":"opt_c","option_c_text":"write","option_d_id":"opt_d","option_d_text":"was writing","correct_option_id":"opt_d","explanation":"The writing was the ongoing background action.","hint":"","pool_id":"U2-STEP","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-STEP-04","unit_id":"MG1_U2","mission":"STEP Practice","stage":"STEP Practice","skill":"Relative Pronouns","difficulty":"متوسط","question_type":"multiple_choice","source_type":"STEP compilation","source_ref":"Dalilk4step compilation","source_original_text":"The man ______ is standing next to the door is our teacher.","prompt":"The man ______ is standing next to the door is our teacher.","option_a_id":"opt_a","option_a_text":"which","option_b_id":"opt_b","option_b_text":"who","option_c_id":"opt_c","option_c_text":"whose","option_d_id":"opt_d","option_d_text":"whom","correct_option_id":"opt_b","explanation":"Who refers to a person as the subject of the relative clause.","hint":"","pool_id":"U2-STEP","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-STEP-05","unit_id":"MG1_U2","mission":"STEP Practice","stage":"STEP Practice","skill":"Adjective + Preposition + Gerund","difficulty":"متوسط","question_type":"multiple_choice","source_type":"STEP compilation","source_ref":"Alhmnii STEP compilation","source_original_text":"He is interested ______ learning English.","prompt":"He is interested ______ learning English.","option_a_id":"opt_a","option_a_text":"in","option_b_id":"opt_b","option_b_text":"on","option_c_id":"opt_c","option_c_text":"at","option_d_id":"opt_d","option_d_text":"for","correct_option_id":"opt_a","explanation":"The fixed expression is interested in.","hint":"","pool_id":"U2-STEP","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-STEP-06","unit_id":"MG1_U2","mission":"STEP Practice","stage":"STEP Practice","skill":"Present Perfect Simple","difficulty":"متوسط","question_type":"multiple_choice","source_type":"STEP compilation","source_ref":"Mulhim STEP compilation","source_original_text":"I will not go on holiday until I ______ all my work.","prompt":"I will not go on holiday until I ______ all my work.","option_a_id":"opt_a","option_a_text":"have completed","option_b_id":"opt_b","option_b_text":"will complete","option_c_id":"opt_c","option_c_text":"completed","option_d_id":"opt_d","option_d_text":"did complete","correct_option_id":"opt_a","explanation":"Present perfect fits completion before the future action.","hint":"","pool_id":"U2-STEP","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-STEP-07","unit_id":"MG1_U2","mission":"STEP Practice","stage":"STEP Practice","skill":"Wh-Questions","difficulty":"متوسط","question_type":"multiple_choice","source_type":"STEP compilation","source_ref":"Mulhim STEP compilation","source_original_text":"I do not understand this sentence. What ______?","prompt":"I do not understand this sentence. What ______?","option_a_id":"opt_a","option_a_text":"does mean this word","option_b_id":"opt_b","option_b_text":"means this word","option_c_id":"opt_c","option_c_text":"does this word mean","option_d_id":"opt_d","option_d_text":"this word does mean","correct_option_id":"opt_c","explanation":"Use does + subject + base verb.","hint":"","pool_id":"U2-STEP","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"},{"question_id":"U2-STEP-08","unit_id":"MG1_U2","mission":"STEP Practice","stage":"STEP Practice","skill":"Prepositions of Time","difficulty":"متوسط","question_type":"multiple_choice","source_type":"STEP compilation","source_ref":"Dalilk4step compilation","source_original_text":"I usually study ______ night.","prompt":"I usually study ______ night.","option_a_id":"opt_a","option_a_text":"in","option_b_id":"opt_b","option_b_text":"on","option_c_id":"opt_c","option_c_text":"at","option_d_id":"opt_d","option_d_text":"for","correct_option_id":"opt_c","explanation":"Use at night.","hint":"","pool_id":"U2-STEP","mastery_points":0,"attempt_limit":2,"certificate_eligible":false,"randomize_options":true,"review_status":"معتمد"}];
  data.questions = (data.questions || []).filter(q => q.unit_id !== "MG1_U2").concat(sourcedQuestions);

  // Dedicated 8-question Unit 2 STEP stop.
  const originalStartStep = J.startStep;
  const originalGo = J.go;
  let stepSession = null;

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const shuffle = a => [...a].sort(() => Math.random() - .5);
  const choices = q => [q.option_a_text,q.option_b_text,q.option_c_text,q.option_d_text];
  const answerIndex = q => ["option_a_id","option_b_id","option_c_id","option_d_id"].findIndex(k => q[k] === q.correct_option_id);
  const host = () => document.querySelector(".student-view");

  function startUnit2Step(uid) {
    if (uid !== "u2") return originalStartStep(uid);
    const u = (data.units || []).find(x => x.id === uid);
    if (!u) return;
    const pool = shuffle((data.questions || []).filter(q => q.unit_id === "MG1_U2" && q.stage === "STEP Practice")).slice(0,8);
    stepSession = {u, queue:pool, pos:0, correct:0, answers:[], started:Date.now()};
    const h = host();
    if (!h) return;
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_JOURNEY.openUnit('u2')">Unit 2</button><span>›</span><b>STEP Practice</b></div>
      <section class="journey-content-card step">
        <span class="journey-kicker">Quick practice • about 7 min</span>
        <h2>Ready for STEP Practice?</h2>
        <p>Five questions from STEP compilations, selected to match Unit 2 grammar.</p>
        <div class="journey-strategy"><span>1</span> Read <i>→</i><span>2</span> Find the clue <i>→</i><span>3</span> Eliminate</div>
        <button class="journey-main-btn" onclick="STEPUP_JOURNEY.beginUnit2Step()">Let’s go</button>
      </section>`;
  }

  function renderStepQuestion() {
    const h = host();
    if (!h || !stepSession) return;
    const q = stepSession.queue[stepSession.pos];
    const ch = choices(q);
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_JOURNEY.openUnit('u2')">Unit 2</button><span>›</span><b>STEP Practice</b></div>
      <section class="journey-question-card">
        <div class="journey-question-meta"><span>STEP Practice</span><b>${stepSession.pos+1}/${stepSession.queue.length}</b></div>
        <h2 dir="ltr">${esc(q.prompt)}</h2>
        <div class="journey-options">${ch.map((x,i)=>`<button onclick="STEPUP_JOURNEY.answerUnit2Step(${i})"><span>${String.fromCharCode(65+i)}</span><b dir="ltr">${esc(x)}</b></button>`).join("")}</div>
      </section>`;
  }

  async function answerUnit2Step(i) {
    if (!stepSession) return;
    const q = stepSession.queue[stepSession.pos];
    const ai = answerIndex(q);
    const ok = i === ai;
    if (ok) stepSession.correct++;
    stepSession.answers.push({
      question_id:q.question_id, stem:q.prompt, skill:q.skill, selected:i, correctAnswer:ai,
      correct:ok, selectedText:choices(q)[i], correctText:choices(q)[ai],
      explanation:q.explanation || "", need:q.hint || ""
    });
    if (stepSession.pos < stepSession.queue.length - 1) {
      stepSession.pos++;
      return renderStepQuestion();
    }
    const s = stepSession;
    const total = s.queue.length;
    const score = s.correct;
    const pct = Math.round(score/total*100);
    try {
      await window.PROVE?.recordJourneyAttempt?.({
        trainingId:"journey-u2-step", trainingTitle:"Quick STEP Practice", trainingType:"step",
        unitId:"u2", unitNumber:2, score, total, percentage:pct,
        elapsedSeconds:Math.max(1,Math.round((Date.now()-s.started)/1000)),
        answers:s.answers, studyMethod:"quick-step"
      });
    } catch(e) { console.warn("Unit 2 STEP save failed",e); }
    const h = host();
    if (h) h.innerHTML = `<section class="journey-result good">
      <div class="journey-result-score">${score}<span>/${total}</span></div>
      <h2>Practice stop complete ⚡</h2>
      <p>This STEP stop uses compilation questions matched to Unit 2.</p>
      <div class="journey-result-actions">
        <button class="journey-main-btn" onclick="PROVE.setStudentTab('journey')">Continue Journey</button>
        <button class="journey-link-btn" onclick="STEPUP_JOURNEY.startStep('u2')">Try again</button>
      </div>
    </section>`;
    stepSession = null;
  }

  J.startStep = startUnit2Step;
  J.go = function(uid,key) {
    if (uid === "u2" && key === "step") return startUnit2Step(uid);
    return originalGo(uid,key);
  };
  J.beginUnit2Step = renderStepQuestion;
  J.answerUnit2Step = answerUnit2Step;
})();

// === Unit 2 skill journey: Vocabulary + STEP-style Reading + STEP-style Listening ===
(() => {
  const J = window.STEPUP_JOURNEY;
  if (!J || !J.data) return;

  const data = J.data;
  const unit = (data.units || []).find(u => u.id === "u2" || Number(u.number) === 2);
  if (!unit) return;

  // Make the skills explicit in the student journey.
  const missionById = id => (unit.missions || []).find(m => m.id === id);
  const m1 = missionById("m1");
  const m2 = missionById("m2");
  const m3 = missionById("m3");
  const m4 = missionById("m4");
  const m5 = missionById("m5");
  const m6 = missionById("m6");

  if (m1) { m1.title = "Vocabulary • Career Words"; m1.sub = "Vocabulary from revision + textbook"; }
  if (m2) { m2.title = "Grammar • Result or Duration?"; }
  if (m3) { m3.title = "Grammar • Good at What?"; }
  if (m4) { m4.title = "Language Functions"; m4.sub = "Simple Present • Wh-Questions • Time • Relative Pronouns • While"; }
  if (m5) { m5.title = "Reading • STEP Style"; m5.sub = "Main idea • detail • inference"; }
  if (m6) { m6.title = "Listening • STEP Style"; m6.sub = "Main idea • detail • inference"; }

  // STEP-style reading questions derived only from the Unit 2 textbook reading.
  const readingQuestions = [
    {
      question_id:"U2-READ-STEP-01", unit_id:"MG1_U2", mission:"5. Reading Career Paths",
      stage:"Mastery", skill:"Reading • Main Idea", difficulty:"متوسط", question_type:"multiple_choice",
      source_type:"Textbook-derived STEP-style", source_ref:"Mega Goal 1 Unit 2 Reading — JobPool Has the Job for You",
      source_original_text:"Textbook reading used as the sole basis.",
      prompt:"What is the main purpose of the passage?",
      option_a_id:"opt_a", option_a_text:"To present different internship opportunities and their requirements",
      option_b_id:"opt_b", option_b_text:"To explain how to start a private company",
      option_c_id:"opt_c", option_c_text:"To compare university subjects",
      option_d_id:"opt_d", option_d_text:"To describe one person's daily routine",
      correct_option_id:"opt_a",
      explanation:"The passage presents several internship openings and the qualifications needed for each.",
      hint:"Look for the idea shared by all sections.", pool_id:"U2-READ-STEP",
      mastery_points:1, attempt_limit:2, certificate_eligible:true, randomize_options:true, review_status:"معتمد"
    },
    {
      question_id:"U2-READ-STEP-02", unit_id:"MG1_U2", mission:"5. Reading Career Paths",
      stage:"Mastery", skill:"Reading • Detail", difficulty:"متوسط", question_type:"multiple_choice",
      source_type:"Textbook-derived STEP-style", source_ref:"Mega Goal 1 Unit 2 Reading — Archaeological Interns",
      source_original_text:"Textbook reading used as the sole basis.",
      prompt:"Which internship is unpaid?",
      option_a_id:"opt_a", option_a_text:"Media Intern",
      option_b_id:"opt_b", option_b_text:"Archaeological Intern",
      option_c_id:"opt_c", option_c_text:"Environmental Engineering",
      option_d_id:"opt_d", option_d_text:"All three internships",
      correct_option_id:"opt_b",
      explanation:"The archaeological internship is described as unpaid, although lodging and meals are provided.",
      hint:"Find the sentence that mentions payment.", pool_id:"U2-READ-STEP",
      mastery_points:1, attempt_limit:2, certificate_eligible:true, randomize_options:true, review_status:"معتمد"
    },
    {
      question_id:"U2-READ-STEP-03", unit_id:"MG1_U2", mission:"5. Reading Career Paths",
      stage:"Mastery", skill:"Reading • Vocabulary in Context", difficulty:"متوسط", question_type:"multiple_choice",
      source_type:"Textbook-derived STEP-style", source_ref:"Mega Goal 1 Unit 2 Reading — Archaeological Interns",
      source_original_text:"The work is hard and painstaking.",
      prompt:"In the passage, the word “painstaking” is closest in meaning to ___.",
      option_a_id:"opt_a", option_a_text:"requiring a lot of care and effort",
      option_b_id:"opt_b", option_b_text:"quick and effortless",
      option_c_id:"opt_c", option_c_text:"highly paid",
      option_d_id:"opt_d", option_d_text:"done only by machines",
      correct_option_id:"opt_a",
      explanation:"The context describes the archaeological work as difficult and requiring careful effort.",
      hint:"Use the words around it, especially “hard”.", pool_id:"U2-READ-STEP",
      mastery_points:1, attempt_limit:2, certificate_eligible:true, randomize_options:true, review_status:"معتمد"
    },
    {
      question_id:"U2-READ-STEP-04", unit_id:"MG1_U2", mission:"5. Reading Career Paths",
      stage:"Mastery", skill:"Reading • Inference", difficulty:"متوسط", question_type:"multiple_choice",
      source_type:"Textbook-derived STEP-style", source_ref:"Mega Goal 1 Unit 2 Reading — Media Intern",
      source_original_text:"Textbook reading used as the sole basis.",
      prompt:"Which applicant is the best match for the media internship?",
      option_a_id:"opt_a", option_a_text:"Someone fluent in English who is friendly and good with computers",
      option_b_id:"opt_b", option_b_text:"Someone who only wants to work outdoors",
      option_c_id:"opt_c", option_c_text:"Someone who cannot summarize information",
      option_d_id:"opt_d", option_d_text:"Someone who avoids meeting guests",
      correct_option_id:"opt_a",
      explanation:"Those qualities match the requirements listed for the media internship.",
      hint:"Combine more than one requirement from the paragraph.", pool_id:"U2-READ-STEP",
      mastery_points:1, attempt_limit:2, certificate_eligible:true, randomize_options:true, review_status:"معتمد"
    }
  ];

  // STEP-style listening questions derived only from the Unit 2 textbook conversation.
  const listeningQuestions = [
    {
      question_id:"U2-LST-STEP-01", unit_id:"MG1_U2", mission:"6. Listening at Work",
      stage:"Mastery", skill:"Listening • Main Idea", difficulty:"متوسط", question_type:"multiple_choice",
      source_type:"Textbook-derived STEP-style", source_ref:"Mega Goal 1 Unit 2 Conversation",
      source_original_text:"Textbook conversation used as the sole basis.",
      prompt:"What are Khaled and Yousef mainly talking about?",
      option_a_id:"opt_a", option_a_text:"Their jobs and career choices",
      option_b_id:"opt_b", option_b_text:"A school exam",
      option_c_id:"opt_c", option_c_text:"A football match",
      option_d_id:"opt_d", option_d_text:"A travel plan",
      correct_option_id:"opt_a",
      explanation:"The conversation focuses on their jobs, satisfaction, and possible career changes.",
      hint:"Listen for the topic repeated across the conversation.", pool_id:"U2-LST-STEP",
      mastery_points:1, attempt_limit:2, certificate_eligible:true, randomize_options:true, review_status:"معتمد"
    },
    {
      question_id:"U2-LST-STEP-02", unit_id:"MG1_U2", mission:"6. Listening at Work",
      stage:"Mastery", skill:"Listening • Detail", difficulty:"متوسط", question_type:"multiple_choice",
      source_type:"Textbook-derived STEP-style", source_ref:"Mega Goal 1 Unit 2 Conversation",
      source_original_text:"Khaled says he has been a reporter at the station for five years.",
      prompt:"How long has Khaled been a reporter at the station?",
      option_a_id:"opt_a", option_a_text:"One year",
      option_b_id:"opt_b", option_b_text:"Three years",
      option_c_id:"opt_c", option_c_text:"Five years",
      option_d_id:"opt_d", option_d_text:"Ten years",
      correct_option_id:"opt_c",
      explanation:"Khaled says he has been a reporter there for five years.",
      hint:"Listen for the number after “for”.", pool_id:"U2-LST-STEP",
      mastery_points:1, attempt_limit:2, certificate_eligible:true, randomize_options:true, review_status:"معتمد"
    },
    {
      question_id:"U2-LST-STEP-03", unit_id:"MG1_U2", mission:"6. Listening at Work",
      stage:"Mastery", skill:"Listening • Detail", difficulty:"متوسط", question_type:"multiple_choice",
      source_type:"Textbook-derived STEP-style", source_ref:"Mega Goal 1 Unit 2 Conversation",
      source_original_text:"Yousef says he was hoping to be a watch repairer.",
      prompt:"What job did Yousef hope to have?",
      option_a_id:"opt_a", option_a_text:"Dentist",
      option_b_id:"opt_b", option_b_text:"Watch repairer",
      option_c_id:"opt_c", option_c_text:"Reporter",
      option_d_id:"opt_d", option_d_text:"Engineer",
      correct_option_id:"opt_b",
      explanation:"Yousef says he was hoping to be a watch repairer.",
      hint:"Listen for “I was hoping to be…”.", pool_id:"U2-LST-STEP",
      mastery_points:1, attempt_limit:2, certificate_eligible:true, randomize_options:true, review_status:"معتمد"
    },
    {
      question_id:"U2-LST-STEP-04", unit_id:"MG1_U2", mission:"6. Listening at Work",
      stage:"Mastery", skill:"Listening • Inference", difficulty:"متوسط", question_type:"multiple_choice",
      source_type:"Textbook-derived STEP-style", source_ref:"Mega Goal 1 Unit 2 Conversation",
      source_original_text:"Yousef says he is bored and wants something more challenging.",
      prompt:"What can be inferred about Yousef's current job?",
      option_a_id:"opt_a", option_a_text:"He is dissatisfied and wants a new challenge",
      option_b_id:"opt_b", option_b_text:"He has just started and loves it",
      option_c_id:"opt_c", option_c_text:"He plans to stay there forever",
      option_d_id:"opt_d", option_d_text:"He works at the TV station",
      correct_option_id:"opt_a",
      explanation:"His comments about being bored and wanting something more challenging show dissatisfaction.",
      hint:"Think about how he feels, not only what job he has.", pool_id:"U2-LST-STEP",
      mastery_points:1, attempt_limit:2, certificate_eligible:true, randomize_options:true, review_status:"معتمد"
    }
  ];

  data.questions = (data.questions || []).filter(q =>
    !(q.unit_id === "MG1_U2" && (
      (q.mission === "5. Reading Career Paths" && q.stage === "Mastery") ||
      (q.mission === "6. Listening at Work" && q.stage === "Mastery")
    ))
  ).concat(readingQuestions, listeningQuestions);

  const priorGo = J.go;
  const priorOpenUnit = J.openUnit;
  const priorHomeHTML = J.homeHTML;
  const priorStartReading = J.startReading;
  const priorStartListening = J.startListening;

  let skillSession = null;
  const host = () => document.querySelector(".student-view");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const optionIds = ["option_a_id","option_b_id","option_c_id","option_d_id"];
  const optionTexts = ["option_a_text","option_b_text","option_c_text","option_d_text"];
  const qChoices = q => optionTexts.map(k => q[k]);
  const qAnswer = q => optionIds.findIndex(k => q[k] === q.correct_option_id);

  function sourceQuestions(mission) {
    return (data.questions || []).filter(q => q.unit_id === "MG1_U2" && q.mission === mission && q.stage === "Mastery");
  }

  function startUnit2Reading(uid) {
    if (uid !== "u2") return priorStartReading(uid);
    const h = host();
    if (!h) return;
    skillSession = {
      kind:"reading", label:"Reading • STEP Style", queue:sourceQuestions("5. Reading Career Paths"),
      pos:0, correct:0, answers:[], started:Date.now(), total:3
    };
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_JOURNEY.openUnit('u2')">Unit 2</button><span>›</span><b>Reading • STEP Style</b></div>
      <section class="journey-content-card">
        <span class="journey-kicker">READ • LOCATE • PROVE</span>
        <h2>Reading the STEP way</h2>
        <p>Use the Unit 2 textbook reading, but answer it with STEP reading strategies.</p>
        <div class="journey-strategy"><span>1</span> Read the question first <i>→</i><span>2</span> Find the keyword <i>→</i><span>3</span> Return to the evidence <i>→</i><span>4</span> Eliminate</div>
        <div class="journey-passage" dir="ltr">${esc(unit.reading)}</div>
        <p><strong>3 questions:</strong> main idea • detail • inference</p>
        <button class="journey-main-btn" onclick="STEPUP_JOURNEY.beginUnit2Skill()">Start Reading Practice</button>
      </section>`;
  }

  function startUnit2Listening(uid) {
    if (uid !== "u2") return priorStartListening(uid);
    const h = host();
    if (!h) return;
    skillSession = {
      kind:"listening", label:"Listening • STEP Style", queue:sourceQuestions("6. Listening at Work"),
      pos:0, correct:0, answers:[], started:Date.now(), total:3
    };
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_JOURNEY.openUnit('u2')">Unit 2</button><span>›</span><b>Listening • STEP Style</b></div>
      <section class="journey-content-card listen">
        <span class="journey-kicker">LISTEN • CATCH • CHOOSE</span>
        <h2>Listening the STEP way</h2>
        <p>Listen for the main idea and key details. You do not need to translate every word.</p>
        <div class="journey-strategy"><span>1</span> Read the task <i>→</i><span>2</span> Listen for keywords <i>→</i><span>3</span> Choose from evidence</div>
        <button class="journey-audio-btn" onclick="STEPUP_JOURNEY.speak('u2')">▶ Play listening</button>
        <p><strong>3 questions:</strong> main idea • detail • inference</p>
        <button class="journey-main-btn" onclick="STEPUP_JOURNEY.beginUnit2Skill()">Start Listening Practice</button>
      </section>`;
  }

  function renderSkillQuestion() {
    const h = host();
    if (!h || !skillSession) return;
    const q = skillSession.queue[skillSession.pos];
    const choices = qChoices(q);
    const replay = skillSession.kind === "listening"
      ? `<button class="journey-audio-btn" onclick="STEPUP_JOURNEY.speak('u2')">▶ Replay audio</button>` : "";
    h.innerHTML = `<div class="journey-breadcrumb"><button onclick="STEPUP_JOURNEY.openUnit('u2')">Unit 2</button><span>›</span><b>${esc(skillSession.label)}</b></div>
      <section class="journey-question-card">
        <div class="journey-question-meta"><span>${esc(q.skill)}</span><b>${skillSession.pos+1}/${skillSession.queue.length}</b></div>
        ${replay}
        <h2 dir="ltr">${esc(q.prompt)}</h2>
        <div class="journey-options">${choices.map((x,i)=>`<button onclick="STEPUP_JOURNEY.answerUnit2Skill(${i})"><span>${String.fromCharCode(65+i)}</span><b dir="ltr">${esc(x)}</b></button>`).join("")}</div>
      </section>`;
  }

  async function answerUnit2Skill(i) {
    if (!skillSession) return;
    const q = skillSession.queue[skillSession.pos];
    const choices = qChoices(q);
    const ai = qAnswer(q);
    const ok = i === ai;
    if (ok) skillSession.correct++;
    skillSession.answers.push({
      question_id:q.question_id, stem:q.prompt, skill:q.skill,
      selected:i, correctAnswer:ai, correct:ok,
      selectedText:choices[i], correctText:choices[ai],
      explanation:q.explanation || "", need:q.hint || ""
    });

    if (skillSession.pos < skillSession.queue.length - 1) {
      skillSession.pos++;
      return renderSkillQuestion();
    }

    const s = skillSession;
    const total = s.queue.length;
    const score = s.correct;
    const pct = Math.round(score / total * 100);
    const passed = score >= 2;
    const key = s.kind === "reading" ? "reading" : "listening";

    try {
      await window.PROVE?.recordJourneyAttempt?.({
        trainingId:`journey-u2-${key}`,
        trainingTitle:s.label,
        trainingType:key,
        unitId:"u2", unitNumber:2,
        score, total, percentage:pct,
        elapsedSeconds:Math.max(1,Math.round((Date.now()-s.started)/1000)),
        answers:s.answers,
        studyMethod:`step-style-${key}`
      });
    } catch(e) {
      console.warn(`Unit 2 ${key} save failed`, e);
    }

    const h = host();
    if (h) {
      h.innerHTML = `<section class="journey-result ${passed ? "good" : "review"}">
        <div class="journey-result-score">${score}<span>/${total}</span></div>
        <h2>${passed ? "Skill stop complete ✨" : "One more quick try"}</h2>
        <p>${passed ? `You completed ${esc(s.label)}.` : `You need 2/3 to complete this stop. Review the evidence and try again.`}</p>
        <div class="journey-result-actions">
          <button class="journey-main-btn" onclick="PROVE.setStudentTab('journey')">Continue Journey</button>
          ${!passed ? `<button class="journey-link-btn" onclick="STEPUP_JOURNEY.${key === "reading" ? "startReading" : "startListening"}('u2')">Try again</button>` : ""}
        </div>
      </section>`;
    }
    skillSession = null;
  }

  J.startReading = startUnit2Reading;
  J.startListening = startUnit2Listening;
  J.beginUnit2Skill = renderSkillQuestion;
  J.answerUnit2Skill = answerUnit2Skill;

  J.go = function(uid,key) {
    if (uid === "u2" && key === "reading") return startUnit2Reading(uid);
    if (uid === "u2" && key === "listening") return startUnit2Listening(uid);
    return priorGo(uid,key);
  };

  J.openUnit = function(uid) {
    const result = priorOpenUnit(uid);
    if (uid === "u2") {
      const h = host();
      if (h) {
        const stageTitle = h.querySelector(".journey-stage-title h2");
        const stageText = h.querySelector(".journey-stage-title p");
        if (stageTitle) stageTitle.textContent = "Vocabulary & Grammar";
        if (stageText) stageText.textContent = "Build the language first, then move to Reading and Listening.";
        h.querySelectorAll(".journey-stop-copy b").forEach(el => {
          if (el.textContent.trim() === "Read") el.textContent = "Reading • STEP Style";
          if (el.textContent.trim() === "Listen") el.textContent = "Listening • STEP Style";
        });
        h.querySelectorAll(".journey-stop-copy small").forEach(el => {
          if (el.textContent.includes("Find evidence")) el.textContent = "Main idea • detail • inference.";
          if (el.textContent.includes("Listen for the idea")) el.textContent = "Main idea • detail • inference.";
          if (el.textContent.includes("6 quick questions")) el.textContent = "5 quick questions • strategy first.";
        });
      }
    }
    return result;
  };

  if (typeof priorHomeHTML === "function") {
    J.homeHTML = function(...args) {
      let html = priorHomeHTML(...args);
      if (html.includes("Unit 2 • Careers")) {
        html = html.replace("<strong>Read</strong>", "<strong>Reading • STEP Style</strong>")
                   .replace("<strong>Listen</strong>", "<strong>Listening • STEP Style</strong>");
      }
      return html;
    };
  }
})();

// === Unit 2 lighter student journey ===
(() => {
  const J = window.STEPUP_JOURNEY;
  if (!J || !J.data) return;

  const data = J.data;
  const unit = (data.units || []).find(u => u.id === "u2" || Number(u.number) === 2);
  if (!unit) return;

  // Reduce required core stops from 4 to 3 while preserving all content:
  // Vocabulary + Grammar + Language Functions.
  const m1 = (unit.missions || []).find(m => m.id === "m1");
  const m2 = (unit.missions || []).find(m => m.id === "m2");
  const m3 = (unit.missions || []).find(m => m.id === "m3");
  const m4 = (unit.missions || []).find(m => m.id === "m4");
  const m7 = (unit.missions || []).find(m => m.id === "m7");

  if (m1) {
    m1.title = "Vocabulary";
    m1.sub = "Career words • Real Talk";
  }
  if (m2) {
    m2.title = "Grammar";
    m2.sub = "Present Perfect • Good at / Interested in";
  }
  if (m4) {
    m4.title = "Language Functions";
    m4.sub = "Simple Present • Wh-Questions • Time • Relative Pronouns • While";
  }
  if (m7) m7.sub = "Final Challenge • 8 questions";

  // Move Good at / Interested in questions into the Grammar mission.
  (data.questions || []).forEach(q => {
    if (q.unit_id === "MG1_U2" && q.mission === "3. Good at What?") {
      q.mission = "2. Experience: Result or Duration?";
    }
  });

  // Remove the separate Good at What? stop from the required student journey.
  unit.missions = (unit.missions || []).filter(m => m.id !== "m3");

  // Reading: 3 questions only — main idea, detail, inference.
  const originalStartReading = J.startReading;
  J.startReading = function(uid) {
    if (uid !== "u2") return originalStartReading(uid);
    const all = (data.questions || []).filter(q =>
      q.unit_id === "MG1_U2" &&
      q.mission === "5. Reading Career Paths" &&
      q.stage === "Mastery"
    );
    const keep = all.filter(q =>
      /Main Idea|Detail|Inference/.test(q.skill || "")
    ).slice(0,3);

    const saved = data.questions;
    data.questions = saved.filter(q =>
      !(q.unit_id === "MG1_U2" &&
        q.mission === "5. Reading Career Paths" &&
        q.stage === "Mastery")
    ).concat(keep);

    try {
      return originalStartReading(uid);
    } finally {
      data.questions = saved;
    }
  };

  // Listening: 3 questions only — main idea, detail, inference.
  const originalStartListening = J.startListening;
  J.startListening = function(uid) {
    if (uid !== "u2") return originalStartListening(uid);
    const all = (data.questions || []).filter(q =>
      q.unit_id === "MG1_U2" &&
      q.mission === "6. Listening at Work" &&
      q.stage === "Mastery"
    );
    const main = all.find(q => /Main Idea/.test(q.skill || ""));
    const detail = all.find(q => /Detail/.test(q.skill || ""));
    const inference = all.find(q => /Inference/.test(q.skill || ""));
    const keep = [main, detail, inference].filter(Boolean);

    const saved = data.questions;
    data.questions = saved.filter(q =>
      !(q.unit_id === "MG1_U2" &&
        q.mission === "6. Listening at Work" &&
        q.stage === "Mastery")
    ).concat(keep);

    try {
      return originalStartListening(uid);
    } finally {
      data.questions = saved;
    }
  };

  // STEP Practice: draw 5 questions from the 8-question compilation bank.
  const prevStartStep = J.startStep;
  J.startStep = function(uid) {
    if (uid !== "u2") return prevStartStep(uid);

    // Reuse the existing Unit 2 STEP renderer, but temporarily expose only 5 random questions.
    const bank = (data.questions || []).filter(q =>
      q.unit_id === "MG1_U2" && q.stage === "STEP Practice"
    );
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0,5);
    const saved = data.questions;
    data.questions = saved.filter(q =>
      !(q.unit_id === "MG1_U2" && q.stage === "STEP Practice")
    ).concat(shuffled);

    try {
      return prevStartStep(uid);
    } finally {
      data.questions = saved;
    }
  };

  // Final Challenge: keep 8 balanced questions instead of 12.
  const finalIds = new Set([
    "U2-FIN-01", // vocabulary
    "U2-FIN-02", // present perfect progressive
    "U2-FIN-03", // adjective + preposition + gerund
    "U2-FIN-04", // time preposition
    "U2-FIN-05", // relative pronoun
    "U2-FIN-06", // simple present
    "U2-FIN-10", // reading
    "U2-FIN-11"  // listening
  ]);
  data.questions = (data.questions || []).filter(q =>
    !(q.unit_id === "MG1_U2" &&
      q.stage === "Final Challenge" &&
      !finalIds.has(q.question_id))
  );

  // Update visible labels where possible.
  const priorOpenUnit = J.openUnit;
  J.openUnit = function(uid) {
    const out = priorOpenUnit(uid);
    if (uid === "u2") {
      const host = document.querySelector(".student-view");
      if (host) {
        host.querySelectorAll(".journey-stop-copy b").forEach(el => {
          if (el.textContent.trim() === "STEP Practice") el.textContent = "STEP Practice • 5 questions";
          if (el.textContent.trim() === "Final Challenge") el.textContent = "Final Challenge • 8 questions";
        });
      }
    }
    return out;
  };
})();

// === Unit 2 Final Challenge: Unit 2 verified grammar + vocabulary ===
(() => {
  const J = window.STEPUP_JOURNEY;
  if (!J || !J.data) return;
  const data = J.data;

  const mission = "7. Careers Challenge";
  const common = {
    unit_id:"MG1_U2",
    mission,
    stage:"Final Challenge",
    difficulty:"متوسط",
    question_type:"multiple_choice",
    mastery_points:1,
    attempt_limit:1,
    certificate_eligible:true,
    randomize_options:true,
    review_status:"معتمد"
  };

  const finals = [
    {
      ...common,
      question_id:"U2-FIN-G01",
      skill:"Present Perfect Progressive",
      source_type:"Textbook",
      source_ref:"Mega Goal 1 Unit 2 — Grammar example",
      source_original_text:"Hanan has been reading a book for two hours.",
      prompt:"Hanan ___ a book for two hours.",
      option_a_id:"opt_a", option_a_text:"has been reading",
      option_b_id:"opt_b", option_b_text:"has read",
      option_c_id:"opt_c", option_c_text:"is reading",
      option_d_id:"opt_d", option_d_text:"read",
      correct_option_id:"opt_a",
      explanation:"For two hours focuses on an ongoing activity and duration.",
      hint:"Duration + continuing activity → present perfect progressive."
    },
    {
      ...common,
      question_id:"U2-FIN-G02",
      skill:"Adjective + Preposition + Gerund",
      source_type:"Textbook",
      source_ref:"Mega Goal 1 Unit 2 — Grammar D model",
      source_original_text:"He's interested in becoming a photographer.",
      prompt:"Hakim is interested in ___ a photographer.",
      option_a_id:"opt_a", option_a_text:"become",
      option_b_id:"opt_b", option_b_text:"becoming",
      option_c_id:"opt_c", option_c_text:"became",
      option_d_id:"opt_d", option_d_text:"to became",
      correct_option_id:"opt_b",
      explanation:"After interested in, use the gerund: becoming.",
      hint:"interested in + verb-ing"
    },
    {
      ...common,
      question_id:"U2-FIN-G03",
      skill:"Wh-Questions • Simple Present",
      source_type:"Textbook",
      source_ref:"Mega Goal 1 Unit 2 — Form, Meaning and Function",
      source_original_text:"Where does he/she work?",
      prompt:"Where ___ she work?",
      option_a_id:"opt_a", option_a_text:"do",
      option_b_id:"opt_b", option_b_text:"does",
      option_c_id:"opt_c", option_c_text:"is",
      option_d_id:"opt_d", option_d_text:"has",
      correct_option_id:"opt_b",
      explanation:"With she, use does + base verb.",
      hint:"does + subject + base verb"
    },
    {
      ...common,
      question_id:"U2-FIN-G04",
      skill:"Prepositions of Time",
      source_type:"Uploaded revision + Unit 2 textbook rule",
      source_ref:"MG -1 General revision Q36; Mega Goal 1 Unit 2 FMF",
      source_original_text:"He works at night.",
      prompt:"He works ___ night.",
      option_a_id:"opt_a", option_a_text:"in",
      option_b_id:"opt_b", option_b_text:"on",
      option_c_id:"opt_c", option_c_text:"at",
      option_d_id:"opt_d", option_d_text:"for",
      correct_option_id:"opt_c",
      explanation:"Use at with night: at night.",
      hint:"at + night"
    },
    {
      ...common,
      question_id:"U2-FIN-G05",
      skill:"Relative Pronouns",
      source_type:"Textbook",
      source_ref:"Mega Goal 1 Unit 2 — Relative Pronouns",
      source_original_text:"The woman who/that was talking to the clients was friendly.",
      prompt:"The woman ___ was talking to the clients was friendly.",
      option_a_id:"opt_a", option_a_text:"who",
      option_b_id:"opt_b", option_b_text:"which",
      option_c_id:"opt_c", option_c_text:"where",
      option_d_id:"opt_d", option_d_text:"when",
      correct_option_id:"opt_a",
      explanation:"Use who for a person.",
      hint:"The antecedent is a person."
    },
    {
      ...common,
      question_id:"U2-FIN-G06",
      skill:"Past Progressive with While",
      source_type:"Textbook",
      source_ref:"Mega Goal 1 Unit 2 — Past Progressive with While",
      source_original_text:"While you were working at the photography studio, I was studying graphic design at college.",
      prompt:"While you were working at the photography studio, I ___ graphic design at college.",
      option_a_id:"opt_a", option_a_text:"was studying",
      option_b_id:"opt_b", option_b_text:"studied",
      option_c_id:"opt_c", option_c_text:"have studied",
      option_d_id:"opt_d", option_d_text:"am studying",
      correct_option_id:"opt_a",
      explanation:"Both actions were happening at the same time in the past.",
      hint:"while + simultaneous past action → was/were + verb-ing"
    },
    {
      ...common,
      question_id:"U2-FIN-V01",
      skill:"Vocabulary • Careers",
      source_type:"Uploaded revision + Unit 2 textbook",
      source_ref:"MG1 Revision 1st term 1447; Mega Goal 1 Unit 2 — Food Scientist",
      source_original_text:"My friend wants to become a scientist and discover new things.",
      prompt:"My friend wants to become a ___ and discover new things.",
      option_a_id:"opt_a", option_a_text:"scientist",
      option_b_id:"opt_b", option_b_text:"flavor",
      option_c_id:"opt_c", option_c_text:"clay",
      option_d_id:"opt_d", option_d_text:"schedule",
      correct_option_id:"opt_a",
      explanation:"Scientist is the career word that completes the sentence.",
      hint:"Choose the job."
    },
    {
      ...common,
      question_id:"U2-FIN-V02",
      skill:"Vocabulary • Real Talk",
      source_type:"Uploaded revision + Unit 2 textbook",
      source_ref:"MG1 Revision 1st term 1447; Mega Goal 1 Unit 2 — Conversation Real Talk",
      source_original_text:"bored to death = very bored",
      prompt:"The phrase “bored to death” means ___.",
      option_a_id:"opt_a", option_a_text:"very bored",
      option_b_id:"opt_b", option_b_text:"very excited",
      option_c_id:"opt_c", option_c_text:"very lucky",
      option_d_id:"opt_d", option_d_text:"very busy",
      correct_option_id:"opt_a",
      explanation:"In Unit 2 Real Talk, bored to death means very bored.",
      hint:"It describes a very strong feeling of boredom."
    }
  ];

  data.questions = (data.questions || []).filter(q =>
    !(q.unit_id === "MG1_U2" && q.stage === "Final Challenge")
  ).concat(finals);
})();
