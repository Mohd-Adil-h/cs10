/**
 * seedCommunity.js
 * Direct MongoDB seeder — bypasses the API entirely.
 * Creates seed users, questions, and answers matching the exact schema.
 *
 * Run: node --env-file=.env scripts/seedCommunity.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Inline models (avoids import path issues) ───────────────────────────────

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['asker', 'answerer', 'admin'], default: 'asker' },
  xp: { type: Number, default: 0 },
  answers_count: { type: Number, default: 0 },
  questions_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema({
  original_query:  { type: String, required: true, trim: true },
  rephrased_query: { type: String, required: true, trim: true },
  category:        { type: String, required: true, lowercase: true, trim: true },
  posted_by:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:          { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
  answer_count:    { type: Number, default: 0 },
  view_count:      { type: Number, default: 0 },
  upvotes:         { type: Number, default: 0 },
  downvotes:       { type: Number, default: 0 },
  net_score:       { type: Number, default: 0 },
  created_at:      { type: Date, default: Date.now },
});

const answerSchema = new mongoose.Schema({
  question_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answered_by:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:           { type: String, required: true, trim: true, minlength: 20, maxlength: 1000 },
  status:            { type: String, enum: ['live', 'flagged', 'hidden'], default: 'live' },
  ai_check_passed:   { type: Boolean, default: true },
  flag_reason:       { type: String, default: null },
  upvotes:           { type: Number, default: 0 },
  downvotes:         { type: Number, default: 0 },
  net_score:         { type: Number, default: 0 },
  promoted_to_corpus:{ type: Boolean, default: false },
  created_at:        { type: Date, default: Date.now },
});

const User     = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);
const Answer   = mongoose.model('Answer', answerSchema);

// ─── Question data (from seed_community.js) ───────────────────────────────────

const RAW_QUESTIONS = [
  // Eligibility & Opt-in
  { q: "I am an alumni, can I still apply for the Vicharanashala internship?", cat: "general" },
  { q: "What is the exact phrase I need to send to Yaksha to opt in?", cat: "general" },
  { q: "Is the VINS internship paid or unpaid?", cat: "general" },
  { q: "Can I do the VINS internship if I am currently a working professional?", cat: "general" },
  { q: "What is the difference between VINS and VISE?", cat: "general" },
  { q: "Will there be a separate selection email after the interview?", cat: "selection" },
  { q: "How long do I have to accept the offer letter once it is issued?", cat: "selection" },
  { q: "What happens if I paraphrase the acceptance statement in my email?", cat: "selection" },
  { q: "I accepted the offer with just 'I accept', can I appeal this?", cat: "selection" },
  { q: "If I fail the appeal for the offer acceptance, what happens?", cat: "selection" },
  // Dates & Leave
  { q: "What is the absolute latest date my internship can end?", cat: "timing" },
  { q: "Is there any grace period if I cannot finish in exactly 2 months?", cat: "timing" },
  { q: "I have my end-semester exams next month, can I take a 1-week leave?", cat: "timing" },
  { q: "If I start in August, will I still get a kickoff Zoom orientation?", cat: "timing" },
  { q: "How do I change my internship dates before the offer letter is issued?", cat: "timing" },
  { q: "My HOD wants to change my dates after the offer letter is issued, what is the process?", cat: "timing" },
  { q: "Do I need to inform Yaksha if I am deferring my start date?", cat: "timing" },
  { q: "What is the maximum daily hours expectation for this internship?", cat: "work" },
  { q: "Are we allowed to take weekends off during the 2 months?", cat: "timing" },
  { q: "Will my internship be terminated if I am found taking college exams during my VINS period?", cat: "conduct" },
  // NOC
  { q: "Who is authorized to sign the No Objection Certificate (NOC)?", cat: "noc" },
  { q: "Can Sudarshan Iyengar sign my NOC?", cat: "noc" },
  { q: "What should I do if my college has its own NOC format?", cat: "noc" },
  { q: "My college HOD is asking for proof before signing the NOC, what should I show them?", cat: "noc" },
  { q: "How exactly do I submit the signed NOC to the team?", cat: "noc" },
  { q: "Can my HOD just send an email instead of signing the physical NOC form?", cat: "noc" },
  { q: "What dates must be written on the NOC form?", cat: "noc" },
  { q: "How long does it take for the NOC to be verified after uploading?", cat: "noc" },
  { q: "I uploaded the self-declaration for a tentative offer, how many days do I have to submit the real NOC?", cat: "noc" },
  { q: "What happens if the dates on my NOC do not match my dashboard dates?", cat: "noc" },
  // Equipment & Tools
  { q: "Is it mandatory to use a Linux or macOS machine?", cat: "work" },
  { q: "Can I use Windows Subsystem for Linux (WSL) instead of a pure Linux OS?", cat: "work" },
  { q: "What software do I need to preload before day 1?", cat: "work" },
  { q: "Am I allowed to join mentor meetings using my mobile phone?", cat: "work" },
  { q: "Do I need to use the same email ID for GitHub, Zoom, and ViBe?", cat: "work" },
  { q: "What happens if I used a different email for GitHub?", cat: "work" },
  { q: "Will the lab provide any cloud credits or hardware for the ML projects?", cat: "work" },
  { q: "Is a webcam strictly required for the ViBe platform?", cat: "work" },
  { q: "Can I use a tablet instead of a laptop to watch Phase 1 videos?", cat: "work" },
  { q: "What terminal software should I install on Windows?", cat: "work" },
  // Teams
  { q: "How many members are required to form a team?", cat: "work" },
  { q: "Can I choose my own teammates from my own college?", cat: "work" },
  { q: "What happens if our team only has 3 members?", cat: "work" },
  { q: "If a teammate drops out mid-way, can we invite a new person?", cat: "work" },
  { q: "Are we allowed to create a WhatsApp group for our 4-person team?", cat: "conduct" },
  { q: "Can I join the general cohort WhatsApp or Discord group?", cat: "conduct" },
  { q: "How will I know who my teammates are and when will they be assigned?", cat: "work" },
  { q: "What should I do if one of my teammates is not contributing?", cat: "conduct" },
  { q: "Can I change my team if I do not get along with them?", cat: "work" },
  { q: "Are teams formed immediately on Day 1?", cat: "work" },
  // Projects & Mentors
  { q: "Will I get to choose the open-source project I want to work on?", cat: "work" },
  { q: "At what phase do we get assigned an official mentor?", cat: "work" },
  { q: "Who guides us during Phase 1 if we do not have a mentor yet?", cat: "work" },
  { q: "Is the project assignment final or can I request a change?", cat: "work" },
  { q: "What kinds of projects does the VLED lab offer?", cat: "work" },
  { q: "Will I be working alone or is the project shared with my team?", cat: "work" },
  { q: "Can I contact my mentor on weekends?", cat: "conduct" },
  { q: "If I complete Bronze and Silver, do I have to do Gold and Platinum?", cat: "work" },
  { q: "What are the benefits of completing Phase 3 and Phase 4?", cat: "certificate" },
  { q: "Does the lab cover travel expenses if I am invited for a lab visit?", cat: "general" },
  // ViBe Platform & Coursework
  { q: "How do I sign up for the ViBe platform?", cat: "work" },
  { q: "Why is ViBe pausing my video constantly?", cat: "work" },
  { q: "Does the ViBe quiet helper record continuous video of my face?", cat: "work" },
  { q: "What should my background look like when using ViBe?", cat: "work" },
  { q: "I am a returning intern, do I need to repeat the MERN stack course?", cat: "work" },
  { q: "How do I request an exemption from coursework if I already know the stacks?", cat: "work" },
  { q: "What happens if I choose to bypass the ViBe platform completely?", cat: "conduct" },
  { q: "What is the passing score for the live-proctored ViBe bypass exam?", cat: "work" },
  { q: "How do I resolve the No course enrolled error on ViBe?", cat: "work" },
  { q: "Why is changing DNS to 8.8.8.8 recommended for ViBe issues?", cat: "work" },
  // Live Sessions & Orientation
  { q: "Are the daily live sessions mandatory for everyone?", cat: "general" },
  { q: "If I am exempt from coursework, do I still need to attend live sessions?", cat: "general" },
  { q: "Will there be recordings available if I miss a live session?", cat: "general" },
  { q: "How do I get the Zoom link for the daily live sessions?", cat: "general" },
  { q: "Is the kickoff Zoom orientation recorded for those who miss it?", cat: "general" },
  { q: "If I start in September, will there be a separate orientation session?", cat: "general" },
  { q: "Can I skip the live sessions if I am working on my Phase 2 project?", cat: "conduct" },
  { q: "What time are the live sessions usually held?", cat: "general" },
  { q: "Who conducts the daily live sessions?", cat: "general" },
  { q: "Is attendance tracked for the live sessions?", cat: "conduct" },
  // Rosetta Journal
  { q: "What exactly is the Rosetta journal?", cat: "work" },
  { q: "How many entries do I need to write in Rosetta?", cat: "work" },
  { q: "Am I allowed to use ChatGPT to help write my Rosetta entries?", cat: "conduct" },
  { q: "If I miss a day, should I leave that entry blank or fill it later?", cat: "work" },
  { q: "Who reads my Rosetta journal during the internship?", cat: "work" },
  { q: "How long should a typical Rosetta entry be?", cat: "work" },
  { q: "What is a thinking routine in the context of Rosetta?", cat: "work" },
  { q: "How do I submit my Rosetta journal at the end of the internship?", cat: "work" },
  { q: "Can I change the title format of my Rosetta Google Doc?", cat: "work" },
  { q: "If I use AI for my project code, is that allowed compared to using it for Rosetta?", cat: "conduct" },
  // Troubleshooting & Support
  { q: "What should I do if I cannot type in the Yaksha chat box?", cat: "general" },
  { q: "How do I escalate an issue to a human using Yaksha?", cat: "general" },
  { q: "What tag should I use in Yaksha for ViBe-specific technical issues?", cat: "general" },
  { q: "Is there any official phone number I can call for support?", cat: "general" },
  { q: "If my interview shows incomplete for 2 days, who should I email?", cat: "selection" },
  { q: "What happens if I email no-reply@vicharanashala.ai by mistake?", cat: "general" },
  { q: "Where can I find the official rules and FAQ for VINS?", cat: "general" },
  { q: "Can my college TPO contact the administration directly?", cat: "general" },
  { q: "Is the troubleshooting WhatsApp group available to everyone?", cat: "general" },
  { q: "How quickly does the team usually respond to an escalate message?", cat: "general" },
  // Certificates & Outcomes
  { q: "Does the final certificate mention that the internship was unpaid?", cat: "certificate" },
  { q: "Will my university receive my grades directly from IIT Ropar?", cat: "certificate" },
  { q: "How do I download the e-certificate once Phase 2 is completed?", cat: "certificate" },
  { q: "Is the VINS certificate physically mailed to my home address?", cat: "certificate" },
  { q: "What happens if I drop out mid-way through Phase 2?", cat: "certificate" },
  { q: "Can I use the certificate to claim academic credit at my college?", cat: "certificate" },
  { q: "Is the certificate digitally signed?", cat: "certificate" },
  { q: "If I only complete Phase 1, do I still get a certificate?", cat: "certificate" },
  { q: "Can I list this internship on my resume as IIT Ropar?", cat: "certificate" },
  { q: "What is the difference between the VINS and VISE certificates?", cat: "certificate" },
];

// ─── Answer lookup (from seed_answers.js) ────────────────────────────────────

const ANSWER_MAP = [
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
  { keywords: ["mobile phone", "zoom"], ans: "No, you must join from your laptop or desktop with a working webcam for all mentor and live sessions." },
  { keywords: ["email", "github", "vibe"], ans: "You must use the exact same email ID across all platforms — GitHub, Zoom, ViBe, and the Portal — to ensure tracking works correctly." },
  { keywords: ["webcam", "vibe"], ans: "Yes, a working webcam is strictly required for the ViBe platform's proctoring and engagement tracking." },
  { keywords: ["team", "members"], ans: "A standard team requires 4 members. Teams of 3 might be merged or assigned an additional member by the mentors." },
  { keywords: ["whatsapp", "discord"], ans: "Official communication is strictly through Yaksha and official channels. Unofficial WhatsApp groups are strongly discouraged." },
  { keywords: ["project", "choose", "open-source"], ans: "Projects are assigned based on your performance in Phase 1 and your stack preferences, but the final assignment is up to the mentors." },
  { keywords: ["mentor", "assigned"], ans: "Mentors are officially assigned at the start of Phase 2 after you complete the ViBe coursework." },
  { keywords: ["vibe", "pause", "pausing"], ans: "ViBe pauses if it detects you are looking away or if your face is obscured. Keep your camera clear and stay focused on the screen." },
  { keywords: ["rosetta", "journal"], ans: "The Rosetta journal is a daily reflective log where you document your learning, challenges, and thinking routines throughout the internship." },
  { keywords: ["chatgpt", "ai", "rosetta"], ans: "You must NOT use ChatGPT to write your Rosetta journal. It is meant to be your authentic daily reflection — using AI defeats its purpose." },
  { keywords: ["yaksha", "escalate"], ans: "If you have a critical issue, type '#escalate' in Yaksha with a clear description, and a human moderator will respond within the day." },
  { keywords: ["certificate", "unpaid"], ans: "The certificate does not explicitly mention 'unpaid', but it highlights your contributions and the rigorous nature of the VINS program." },
  { keywords: ["certificate", "download", "e-certificate"], ans: "You can download your e-certificate directly from the ViBe portal once Phase 2 is officially marked as complete." },
  { keywords: ["certificate", "mailed", "physically"], ans: "The certificate is issued digitally. No physical copy is mailed to your home address." },
  { keywords: ["drop out", "mid-way"], ans: "If you drop out mid-way through Phase 2, you will not receive a certificate. You must complete the phase to qualify." },
  { keywords: ["resume", "iit ropar"], ans: "Yes, you can list this internship on your resume as 'Research Intern at IIT Ropar (Vicharanashala Lab)', which is completely accurate." },
  { keywords: ["noc", "dates", "match"], ans: "The dates on your NOC must exactly match the dates shown on your intern dashboard. Any mismatch will require a re-submission." },
  { keywords: ["noc", "days", "submit"], ans: "You typically have 7 days from your tentative offer to upload your signed NOC. Missing this deadline may result in offer cancellation." },
  { keywords: ["noc", "verified", "uploading"], ans: "NOC verification usually takes 2-3 working days after uploading. You'll receive a confirmation via the portal or Yaksha." },
  { keywords: ["live sessions", "mandatory"], ans: "Yes, daily live sessions are mandatory for all interns unless you have an officially approved exemption on file." },
  { keywords: ["live sessions", "skip"], ans: "You cannot skip live sessions without prior approval. Consistent absences may be flagged and can affect your completion status." },
  { keywords: ["recordings", "miss"], ans: "In most cases, recordings of live sessions are shared within 24 hours in the official channel. Check with your cohort moderator." },
];

function generateAnswer(question) {
  const lq = question.toLowerCase();
  for (const item of ANSWER_MAP) {
    if (item.keywords.some(kw => lq.includes(kw))) return item.ans;
  }
  return "That is a great question! Please refer to the official Vicharanashala handbook or ask Yaksha directly for the most accurate and up-to-date information on this topic.";
}

// ─── Seed users ───────────────────────────────────────────────────────────────

const SEED_PASSWORD = 'SeedPass@2025';

async function getOrCreateUsers() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const askers = [];
  for (let i = 1; i <= 15; i++) {
    const email = `seed_asker_${i}@example.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: `Student ${100 + i}`,
        email,
        password_hash: passwordHash,
        role: 'asker',
        xp: Math.floor(Math.random() * 50),
      });
    }
    askers.push(user);
  }

  const answerers = [];
  for (let i = 1; i <= 5; i++) {
    const email = `seed_mentor_${i}@example.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: `Mentor ${i}`,
        email,
        password_hash: passwordHash,
        role: 'answerer',
        xp: Math.floor(Math.random() * 200) + 50,
      });
    }
    answerers.push(user);
  }

  return { askers, answerers };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!\n');

  // Create seed users
  console.log('👥 Creating seed users...');
  const { askers, answerers } = await getOrCreateUsers();
  console.log(`   ${askers.length} askers, ${answerers.length} answerers ready.\n`);

  // Seed questions
  console.log(`📝 Seeding ${RAW_QUESTIONS.length} questions...`);
  let qCreated = 0, qSkipped = 0;
  const createdQuestions = [];

  for (const item of RAW_QUESTIONS) {
    // Skip if already seeded (avoid duplicates)
    const exists = await Question.findOne({ original_query: item.q });
    if (exists) {
      qSkipped++;
      createdQuestions.push(exists);
      continue;
    }

    const asker = askers[Math.floor(Math.random() * askers.length)];
    const q = await Question.create({
      original_query:  item.q,
      rephrased_query: item.q, // same as original for seeds
      category:        item.cat,
      posted_by:       asker._id,
      status:          'open',
      created_at:      new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // random within last week
    });

    // Increment questions_count on asker
    await User.findByIdAndUpdate(asker._id, { $inc: { questions_count: 1 } });

    createdQuestions.push(q);
    qCreated++;
  }
  console.log(`   ✅ Created: ${qCreated} | Skipped (already exist): ${qSkipped}\n`);

  // Seed answers (~70% of questions get an answer)
  console.log('💬 Seeding answers (~70% coverage)...');
  let aCreated = 0, aSkipped = 0;

  for (const q of createdQuestions) {
    // Skip 30% randomly
    if (Math.random() > 0.7) continue;

    // Skip if this question already has an answer
    const existingAnswer = await Answer.findOne({ question_id: q._id });
    if (existingAnswer) {
      aSkipped++;
      continue;
    }

    const answerer = answerers[Math.floor(Math.random() * answerers.length)];
    const content  = generateAnswer(q.original_query);
    const votes    = Math.floor(Math.random() * 20);

    await Answer.create({
      question_id:     q._id,
      answered_by:     answerer._id,
      content,
      status:          'live',
      ai_check_passed: true,
      upvotes:         votes,
      downvotes:       Math.floor(votes * 0.1),
      net_score:       votes - Math.floor(votes * 0.1),
      created_at:      new Date(q.created_at.getTime() + Math.random() * 12 * 60 * 60 * 1000),
    });

    // Update question stats
    await Question.findByIdAndUpdate(q._id, {
      answer_count: 1,
      status: 'answered',
    });

    // Increment answerer's counts
    await User.findByIdAndUpdate(answerer._id, {
      $inc: { answers_count: 1, xp: 10 },
    });

    aCreated++;
  }
  console.log(`   ✅ Created: ${aCreated} | Skipped (already answered): ${aSkipped}\n`);

  console.log('🎉 Seeding complete!');
  console.log(`   Questions in DB: ${await Question.countDocuments()}`);
  console.log(`   Answers in DB:   ${await Answer.countDocuments()}`);
  console.log(`   Users in DB:     ${await User.countDocuments()}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
