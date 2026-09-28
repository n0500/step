// StepUp • Unit 2 Class Mode Reading Review — ORIGINAL textbook text
(() => {
  "use strict";

  const data = window.PROVEIT_DATA;
  if (!data || !Array.isArray(data.units)) return;

  const unit = data.units.find(u => u.id === "u2" || Number(u.number) === 2);
  if (!unit) return;

  unit.available = true;
  unit.trainings = Array.isArray(unit.trainings) ? unit.trainings : [];
  unit.trainings = unit.trainings.filter(t => t.id !== "u2-reading-review");

  const about = `JobPool is a privately-owned career network with branches all over the world. Since its foundation in 2000, the company has constantly improved its users’ experience with new features and services. JobPool has been growing globally through strategic international expansion. We have helped professionals and companies all over the world to meet each other.`;

  const media = `Do you want to be part of the fast-paced world of television and meet famous people at the same time? Here’s your chance. Our interns research information about hot topics. They need to find information quickly and be able to summarize it in clear language. Our hosts use the information on their programs. Our interns also greet our guests when they arrive in our studios. You need to be fluent in English and be good at using computers. And you must be friendly and outgoing. This is a paid internship for the summer.`;

  const archaeology = `Here’s an opportunity to study history firsthand and to work with noted archaeologists on an exciting dig. We’ve been uncovering ruins at the famous ancient city of Pompeii for several years. Interns’ job is to dig slowly and carefully. They also work to uncover buildings that have been buried for centuries. It is very hard and painstaking work. The reward is a chance to discover something that the volcano Vesuvius buried with its lava two thousand years ago. This is an unpaid three-month internship, but lodging and meals are provided near the site.`;

  const engineering = `Great opportunity for a civil engineering graduate student in the environment field! This project involves the construction of a road and a number of other local projects, such as research centers and new pipelines. The interns work alongside experienced civil engineers and receive training in the different work sectors. You need to be able to read blueprints, have some knowledge of Arabic, and be able to cope with temperatures that average 104°F (40°C). Food and accommodation will be provided.`;

  const resume = {
    name: "Carl Barthes",
    contact: [
      "543 Limerick Road",
      "Englewood, New Jersey 07632",
      "Telephone: 201-555-7287 • Cell phone: 201-555-7398",
      "email: cbarthes@worldnet.com"
    ],
    education: [
      "Undergraduate student at Center University, majoring in Media Studies",
      "Graduate of City High School"
    ],
    experience: [
      "Host of radio program. Responsibilities include:",
      "Interview people about teen-related issues on the air",
      "Decide on topics and help organize the show",
      "In charge of school website “School Days”",
      "Have written articles on community issues and on student concerns. Have done interviews and research to get background information."
    ],
    honors: [
      "The school website won an award as one of the most useful to students in the state.",
      "An article I wrote about jobs for young people has appeared in the local press."
    ],
    skills: [
      "Computer expertise in word-processing and graphic programs",
      "Fluent in Spanish"
    ]
  };

  const readingTraining = {
    id: "u2-reading-review",
    type: "reading",
    title: "Unit 2 • Reading Review",
    subtitle: "Reading Comprehension • JobPool Has the Job for You",
    durationSeconds: 420,
    source: "Mega Goal 1 Student Book — Unit 2: Careers — Reading, pp. 26–27.",
    teachSections: { about, media, archaeology, engineering, resume },
    passage: `
      <p><strong>JobPool Has the Job for You</strong></p>
      <p><strong>About Us:</strong></p>
      <p>${about}</p>
      <p><strong>Media Intern: TV and Radio Media International</strong></p>
      <p>${media}</p>
      <p><strong>Archaeological Interns: Students Learning Overseas</strong></p>
      <p>${archaeology}</p>
      <p><strong>Environmental Engineering: Saudi Construction, Riyadh</strong></p>
      <p>${engineering}</p>
      <p><strong>Send applications to:</strong> internships@jpool.com Attach a cover letter and a résumé.</p>
    `,
    questions: [
      {
        skill: "Main Idea",
        stem: "What is the main purpose of the JobPool reading?",
        choices: [
          "To describe several internship opportunities and their requirements.",
          "To explain how to start a private company.",
          "To compare university majors in different countries.",
          "To teach students how to write a résumé."
        ],
        answer: 0,
        explanation: "The reading presents several internship openings and the qualifications or conditions for each one.",
        need: "Look for the idea that covers the whole reading, not just one opening."
      },
      {
        skill: "Specific Detail",
        stem: "Which internship is unpaid?",
        choices: [
          "Media Intern",
          "Archaeological Interns",
          "Environmental Engineering",
          "All of them"
        ],
        answer: 1,
        explanation: "The Archaeological Interns opening states that it is an unpaid three-month internship.",
        need: "Scan the openings for the exact word unpaid."
      },
      {
        skill: "Inference",
        stem: "Who would be the best applicant for the Media Intern position?",
        choices: [
          "A student who is fluent in English, friendly, and good with computers.",
          "A student who dislikes working with people.",
          "A student who only wants outdoor fieldwork.",
          "A student who cannot summarize information."
        ],
        answer: 0,
        explanation: "The Media Intern opening requires English fluency, computer skills, and a friendly, outgoing personality.",
        need: "Match the applicant’s qualities with the requirements in the original text."
      }
    ]
  };

  unit.trainings.unshift(readingTraining);
})();
