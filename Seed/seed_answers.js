const fs = require('fs');

const genericAnswers = [
  { keywords: ["alumni", "apply", "eligible"], ans: "Yes, alumni are absolutely eligible to apply as long as they meet the baseline criteria and can commit the required hours." },
  { keywords: ["yaksha", "opt in", "phrase"], ans: "The exact phrase to opt in with Yaksha is usually 'Yaksha opt-in' or following the automated prompt in your chat." },
  { keywords: ["paid", "unpaid", "stipend"], ans: "The VINS internship is unpaid, but it offers immense learning value, mentorship, and a certificate from IIT Ropar." },
  { keywords: ["working professional", "job"], ans: "It can be difficult to manage alongside a full-time job due to the rigorous daily live sessions and coursework." },
  { keywords: ["vise", "vins", "difference"], ans: "VINS is the software engineering track, while VISE focuses more on specific research tracks or alternate domains." },
  { keywords: ["offer letter", "accept", "how long"], ans: "You typically have 48 hours to formally accept the offer letter from the time it is issued." },
  { keywords: ["paraphrase", "acceptance"], ans: "Please do not paraphrase the acceptance statement. Copy and paste it exactly as requested to avoid automated rejection." },
  { keywords: ["fail", "appeal", "unsuccessful"], ans: "If the appeal is unsuccessful, the offer is permanently revoked and you must reapply next cohort." },
  { keywords: ["latest date", "end"], ans: "The internship must conclude within the strict 2-month window. Extensions are rarely granted." },
  { keywords: ["grace period", "finish"], ans: "There is a strict deadline, though a minor grace period of 2-3 days might be granted in exceptional circumstances." },
  { keywords: ["leave", "exams"], ans: "You can request a leave of absence for exams, but you will need to extend your end date or make up the hours." },
  { keywords: ["orientation", "kickoff"], ans: "Yes, there is always a mandatory Zoom orientation regardless of which month your cohort starts." },
  { keywords: ["dates", "change", "dashboard"], ans: "You can request a date change via Yaksha or the portal before the offer is issued. Afterwards, it requires HOD approval." },
  { keywords: ["hours", "daily"], ans: "Expect to dedicate around 6-8 hours daily to keep up with the coursework, live sessions, and Rosetta journal." },
  { keywords: ["weekends"], ans: "Weekends are generally yours, but many interns use them to catch up on ViBe coursework or project tasks." },
  { keywords: ["noc", "sign", "authorized"], ans: "The NOC must be signed by your HOD, Placement Officer, or the Principal of your institution." },
  { keywords: ["format", "college"], ans: "If your college has its own format, please escalate to Yaksha to see if it is acceptable. Usually, the provided template is mandatory." },
  { keywords: ["linux", "macos", "wsl", "windows"], ans: "While pure Linux or macOS is heavily recommended, WSL2 on Windows 11 is generally acceptable for most stacks." },
  { keywords: ["mobile phone", "zoom"], ans: "No, you must join from your laptop/desktop with a working webcam for all mentor and live sessions." },
  { keywords: ["email", "github", "vibe"], ans: "You must use the exact same email ID across all platforms (GitHub, Zoom, ViBe, Portal) to ensure tracking works." },
  { keywords: ["webcam", "vibe"], ans: "Yes, a working webcam is strictly required for the ViBe platform's proctoring and engagement tracking." },
  { keywords: ["team", "members"], ans: "A standard team requires 4 members. Teams of 3 might be merged or assigned an additional member." },
  { keywords: ["whatsapp", "discord"], ans: "Official communication is strictly through Yaksha and official channels. Unofficial WhatsApp groups are discouraged." },
  { keywords: ["project", "choose", "open-source"], ans: "Projects are assigned based on your performance in Phase 1 and stack preferences, but final assignment is up to the mentors." },
  { keywords: ["mentor", "assigned"], ans: "Mentors are officially assigned at the start of Phase 2 after you complete the ViBe coursework." },
  { keywords: ["vibe", "pause", "pausing"], ans: "ViBe pauses if it detects you are looking away or if your face is obscured. Keep your camera clear and stay focused." },
  { keywords: ["rosetta", "journal"], ans: "The Rosetta journal is a daily reflective log where you document your learning, challenges, and thinking routines." },
  { keywords: ["chatgpt", "ai", "rosetta"], ans: "You must NOT use ChatGPT to write your Rosetta journal. It is meant to be your authentic daily reflection." },
  { keywords: ["yaksha", "escalate"], ans: "If you have a critical issue, type '#escalate' in Yaksha with a clear description, and a human moderator will respond." },
  { keywords: ["certificate", "unpaid"], ans: "The certificate does not explicitly mention 'unpaid', but it highlights your contributions and the rigorous nature of VINS." }
];

function generateAnswer(question) {
  const lowerQ = question.toLowerCase();
  for (const item of genericAnswers) {
    const match = item.keywords.some(kw => lowerQ.includes(kw));
    if (match) return item.ans;
  }
  return "That is a great question. Please refer to the official Vicharanashala handbook or ask Yaksha for the most up-to-date policy.";
}

async function seedAnswers() {
  console.log("Fetching community questions...");
  const res = await fetch('http://localhost:5000/api/community/questions?limit=100');
  const data = await res.json();
  const questions = data.items || [];

  if (questions.length === 0) {
    console.log("No questions found.");
    return;
  }

  console.log(`Found ${questions.length} questions. Seeding answers...`);
  
  let successCount = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    // Randomly decide if we should answer (e.g. 70% chance)
    if (Math.random() > 0.7) continue;

    const answerText = generateAnswer(q.rawText || q.question || "");
    
    try {
      const postRes = await fetch(`http://localhost:5000/api/community/questions/${q._id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerText: answerText,
          answeredBy: `Mentor ${Math.floor(Math.random() * 50) + 1}`
        })
      });

      if (!postRes.ok) throw new Error(`HTTP ${postRes.status}`);
      successCount++;
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`Failed to answer question ${q._id}: ${e.message}`);
    }
  }

  console.log(`Done! Successfully posted ${successCount} answers.`);
}

seedAnswers();
