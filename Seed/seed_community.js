

const questions = [
  // Eligibility & Opt-in
  "I am an alumni, can I still apply for the Vicharanashala internship?",
  "What is the exact phrase I need to send to Yaksha to opt in?",
  "Is the VINS internship paid or unpaid?",
  "Can I do the VINS internship if I am currently a working professional?",
  "What is the difference between VINS and VISE?",
  "Will there be a separate selection email after the interview?",
  "How long do I have to accept the offer letter once it's issued?",
  "What happens if I paraphrase the acceptance statement in my email?",
  "I accepted the offer with just 'I accept', can I appeal this?",
  "If I fail the appeal for the offer acceptance, what happens?",

  // Dates & Leave
  "What is the absolute latest date my internship can end?",
  "Is there any grace period if I can't finish in exactly 2 months?",
  "I have my end-semester exams next month, can I take a 1-week leave?",
  "If I start in August, will I still get a kickoff Zoom orientation?",
  "How do I change my internship dates before the offer letter is issued?",
  "My HOD wants to change my dates after the offer letter is issued, what is the process?",
  "Do I need to inform Yaksha if I am deferring my start date?",
  "What is the maximum daily hours expectation for this internship?",
  "Are we allowed to take weekends off during the 2 months?",
  "Will my internship be terminated if I am found taking college exams during my VINS period?",

  // NOC
  "Who is authorized to sign the No Objection Certificate (NOC)?",
  "Can Sudarshan Iyengar sign my NOC?",
  "What should I do if my college has its own NOC format?",
  "My college HOD is asking for proof before signing the NOC, what should I show them?",
  "How exactly do I submit the signed NOC to the team?",
  "Can my HOD just send an email instead of signing the physical NOC form?",
  "What dates must be written on the NOC form?",
  "How long does it take for the NOC to be verified after uploading?",
  "I uploaded the self-declaration for a tentative offer, how many days do I have to submit the real NOC?",
  "What happens if the dates on my NOC do not match my dashboard dates?",

  // Equipment & Tools
  "Is it mandatory to use a Linux or macOS machine?",
  "Can I use Windows Subsystem for Linux (WSL) instead of a pure Linux OS?",
  "What software do I need to preload before day 1?",
  "Am I allowed to join mentor meetings using my mobile phone?",
  "Do I need to use the same email ID for GitHub, Zoom, and ViBe?",
  "What happens if I used a different email for GitHub?",
  "Will the lab provide any cloud credits or hardware for the ML projects?",
  "Is a webcam strictly required for the ViBe platform?",
  "Can I use a tablet instead of a laptop to watch Phase 1 videos?",
  "What terminal software should I install on Windows?",

  // Teams
  "How many members are required to form a team?",
  "Can I choose my own teammates from my own college?",
  "What happens if our team only has 3 members?",
  "If a teammate drops out mid-way, can we invite a new person?",
  "Are we allowed to create a WhatsApp group for our 4-person team?",
  "Can I join the general cohort WhatsApp or Discord group?",
  "How will I know who my teammates are and when will they be assigned?",
  "What should I do if one of my teammates is not contributing?",
  "Can I change my team if I don't get along with them?",
  "Are teams formed immediately on Day 1?",

  // Projects & Mentors
  "Will I get to choose the open-source project I want to work on?",
  "At what phase do we get assigned an official mentor?",
  "Who guides us during Phase 1 if we don't have a mentor yet?",
  "Is the project assignment final or can I request a change?",
  "What kinds of projects does the VLED lab offer?",
  "Will I be working alone or is the project shared with my team?",
  "Can I contact my mentor on weekends?",
  "If I complete Bronze and Silver, do I have to do Gold and Platinum?",
  "What are the benefits of completing Phase 3 and Phase 4?",
  "Does the lab cover travel expenses if I am invited for a lab visit?",

  // ViBe Platform & Coursework
  "How do I sign up for the ViBe platform?",
  "Why is ViBe pausing my video constantly?",
  "Does the ViBe 'quiet helper' record continuous video of my face?",
  "What should my background look like when using ViBe?",
  "I am a returning intern, do I need to repeat the MERN stack course?",
  "How do I request an exemption from coursework if I already know the stacks?",
  "What happens if I choose to bypass the ViBe platform completely?",
  "What is the passing score for the live-proctored ViBe bypass exam?",
  "How do I resolve the 'No course enrolled' error on ViBe?",
  "Why is changing DNS to 8.8.8.8 recommended for ViBe issues?",

  // Live Sessions & Orientation
  "Are the daily live sessions mandatory for everyone?",
  "If I am exempt from coursework, do I still need to attend live sessions?",
  "Will there be recordings available if I miss a live session?",
  "How do I get the Zoom link for the daily live sessions?",
  "Is the kickoff Zoom orientation recorded for those who miss it?",
  "If I start in September, will there be a separate orientation session?",
  "Can I skip the live sessions if I am working on my Phase 2 project?",
  "What time are the live sessions usually held?",
  "Who conducts the daily live sessions?",
  "Is attendance tracked for the live sessions?",

  // Rosetta Journal
  "What exactly is the Rosetta journal?",
  "How many entries do I need to write in Rosetta?",
  "Am I allowed to use ChatGPT to help write my Rosetta entries?",
  "If I miss a day, should I leave that entry blank or fill it later?",
  "Who reads my Rosetta journal during the internship?",
  "How long should a typical Rosetta entry be?",
  "What is a 'thinking routine' in the context of Rosetta?",
  "How do I submit my Rosetta journal at the end of the internship?",
  "Can I change the title format of my Rosetta Google Doc?",
  "If I use AI for my project code, is that allowed compared to using it for Rosetta?",

  // Troubleshooting & Support
  "What should I do if I cannot type in the Yaksha chat box?",
  "How do I escalate an issue to a human using Yaksha?",
  "What tag should I use in Yaksha for ViBe-specific technical issues?",
  "Is there any official phone number I can call for support?",
  "If my interview shows 'incomplete' for 2 days, who should I email?",
  "What happens if I email no-reply@vicharanashala.ai by mistake?",
  "Where can I find the official rules and FAQ for VINS?",
  "Can my college TPO contact the administration directly?",
  "Is the troubleshooting WhatsApp group available to everyone?",
  "How quickly does the team usually respond to an #escalate message?",

  // Certificates & Outcomes
  "Does the final certificate mention that the internship was unpaid?",
  "Will my university receive my grades directly from IIT Ropar?",
  "How do I download the e-certificate once Phase 2 is completed?",
  "Is the VINS certificate physically mailed to my home address?",
  "What happens if I drop out mid-way through Phase 2?",
  "Can I use the certificate to claim academic credit at my college?",
  "Is the certificate digitally signed?",
  "If I only complete Phase 1, do I still get a certificate?",
  "Can I list this internship on my resume as 'IIT Ropar'?",
  "What is the difference between the VINS and VISE certificates?"
];

async function seed() {
  console.log(`Seeding ${questions.length} questions to the Community...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < questions.length; i++) {
    try {
      const q = questions[i];
      const res = await fetch('http://localhost:5000/api/community/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          askedBy: `Student ${Math.floor(Math.random() * 900) + 100}`,
          categoryHint: "General"
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      successCount++;
      // Sleep slightly to prevent rate limiting or overlapping too fast
      await new Promise(r => setTimeout(r, 1000));
      if (i % 10 === 0 && i > 0) console.log(`Posted ${i} questions...`);
    } catch (e) {
      failCount++;
      console.error(`Failed to post question ${i}: ${e.message}`);
    }
  }

  console.log(`Done! Successfully posted: ${successCount}. Failed: ${failCount}`);
}

seed();
