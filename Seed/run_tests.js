require('dotenv').config();
const mongoose = require('mongoose');
const { classifyOnly } = require('./src/services/query.service');
const env = require('./src/config/env');

const testCases = [
  // IMPORTANT (35)
  { input: "How do I get my NOC signed if my HOD is on leave?", expected: "IMPORTANT" },
  { input: "My interview shows incomplete on the dashboard even after 3 hours. What do I do?", expected: "IMPORTANT" },
  { input: "Can I use a Mac for the internship or is Windows mandatory?", expected: "IMPORTANT" },
  { input: "I am currently working as a software developer, can I apply for VINS?", expected: "IMPORTANT" },
  { input: "Where do I upload the signed NOC?", expected: "IMPORTANT" },
  { input: "If I miss a day of Rosetta, will I lose my certificate?", expected: "IMPORTANT" },
  { input: "I need to take a 2-day leave for my college exams next week, is that allowed?", expected: "IMPORTANT" },
  { input: "How do I log in to the ViBe platform?", expected: "IMPORTANT" },
  { input: "Do I get a stipend if I perform exceptionally well?", expected: "IMPORTANT" },
  { input: "Is the kickoff Zoom orientation mandatory for the August cohort?", expected: "IMPORTANT" },
  { input: "What should I do if my ViBe video keeps pausing?", expected: "IMPORTANT" },
  { input: "How do I get an exemption from the MERN stack course as a returning intern?", expected: "IMPORTANT" },
  { input: "Can I form a team with my friends from the same college?", expected: "IMPORTANT" },
  { input: "My teammate is inactive and not responding, how do I report them?", expected: "IMPORTANT" },
  { input: "Is it allowed to use ChatGPT for writing the Rosetta journal?", expected: "IMPORTANT" },
  { input: "How do I accept the offer letter correctly?", expected: "IMPORTANT" },
  { input: "I accidentally changed the subject line while accepting the offer, what happens now?", expected: "IMPORTANT" },
  { input: "Where do I find the mentor assigned to me?", expected: "IMPORTANT" },
  { input: "Does the certificate state that the internship was done online?", expected: "IMPORTANT" },
  { input: "Will the grades be sent directly to my university for academic credit?", expected: "IMPORTANT" },
  { input: "What happens if I score below 60% in the ViBe bypass exam?", expected: "IMPORTANT" },
  { input: "I cannot type in the Yaksha chat box, how do I fix it?", expected: "IMPORTANT" },
  { input: "Are we allowed to create a WhatsApp group for our 4-person team?", expected: "IMPORTANT" },
  { input: "How do I escalate a technical issue with ViBe to a human?", expected: "IMPORTANT" },
  { input: "What is the deadline to finish the internship regardless of my start date?", expected: "IMPORTANT" },
  { input: "Can I change my internship dates after the offer letter is issued?", expected: "IMPORTANT" },
  { input: "Is camera and mic access absolutely required for ViBe?", expected: "IMPORTANT" },
  { input: "What should I name my Rosetta document?", expected: "IMPORTANT" },
  { input: "I am a first-time intern but already know the tech stack, can I skip the coursework?", expected: "IMPORTANT" },
  { input: "How many hours a day am I expected to work?", expected: "IMPORTANT" },
  { input: "I replied 'I accept' to the offer letter, is my offer withdrawn?", expected: "IMPORTANT" },
  { input: "Who evaluates our daily Rosetta entries?", expected: "IMPORTANT" },
  { input: "Can I join meetings using my mobile phone?", expected: "IMPORTANT" },
  { input: "What happens in Phase 2 of the internship?", expected: "IMPORTANT" },
  { input: "How do I download the blank NOC template?", expected: "IMPORTANT" },

  // MODERATE (30)
  { input: "I have an issue with the platform", expected: "MODERATE" },
  { input: "When does it start?", expected: "MODERATE" },
  { input: "NOC problem", expected: "MODERATE" },
  { input: "Team is not working", expected: "MODERATE" },
  { input: "I want to change date", expected: "MODERATE" },
  { input: "How to use Rosetta?", expected: "MODERATE" },
  { input: "Offer letter not coming", expected: "MODERATE" },
  { input: "Is there money?", expected: "MODERATE" },
  { input: "Yaksha chat broken", expected: "MODERATE" },
  { input: "what happens if internet goes out during vibe", expected: "MODERATE" },
  { input: "tell me about the phases", expected: "MODERATE" },
  { input: "what is VINS", expected: "MODERATE" },
  { input: "Pls help with certificate", expected: "MODERATE" },
  { input: "Who is Yaksha", expected: "MODERATE" },
  { input: "camera not working", expected: "MODERATE" },
  { input: "I am late for submission", expected: "MODERATE" },
  { input: "What software do I install", expected: "MODERATE" },
  { input: "Can I work on weekends only", expected: "MODERATE" },
  { input: "My HOD is asking for proof", expected: "MODERATE" },
  { input: "I did not get selection email", expected: "MODERATE" },
  { input: "Are live sessions recorded", expected: "MODERATE" },
  { input: "where is my mentor", expected: "MODERATE" },
  { input: "I want to appeal my rejection", expected: "MODERATE" },
  { input: "how big are teams", expected: "MODERATE" },
  { input: "ViBe looping error", expected: "MODERATE" },
  { input: "MERN stack exemption", expected: "MODERATE" },
  { input: "how to write journal", expected: "MODERATE" },
  { input: "which project will I get", expected: "MODERATE" },
  { input: "can I do offline", expected: "MODERATE" },
  { input: "when will I get zoom link", expected: "MODERATE" },

  // UNIMPORTANT (35)
  { input: "Hi", expected: "UNIMPORTANT" },
  { input: "Hello sir good morning", expected: "UNIMPORTANT" },
  { input: "test test test", expected: "UNIMPORTANT" },
  { input: "ajsdhfkjashdf", expected: "UNIMPORTANT" },
  { input: "What is the capital of France?", expected: "UNIMPORTANT" },
  { input: "Check out my new app at [link]", expected: "UNIMPORTANT" },
  { input: "Can you do my homework for me?", expected: "UNIMPORTANT" },
  { input: "Please subscribe to my youtube channel", expected: "UNIMPORTANT" },
  { input: "bro how r u", expected: "UNIMPORTANT" },
  { input: "ok", expected: "UNIMPORTANT" },
  { input: "thanks", expected: "UNIMPORTANT" },
  { input: "bye", expected: "UNIMPORTANT" },
  { input: "Buy cheap sneakers here", expected: "UNIMPORTANT" },
  { input: ".", expected: "UNIMPORTANT" },
  { input: "12345", expected: "UNIMPORTANT" },
  { input: "help", expected: "UNIMPORTANT" },
  { input: "I like pizza", expected: "UNIMPORTANT" },
  { input: "Any single girls here?", expected: "UNIMPORTANT" },
  { input: "why is the sky blue", expected: "UNIMPORTANT" },
  { input: "asdfghjkl", expected: "UNIMPORTANT" },
  { input: "hello everyone", expected: "UNIMPORTANT" },
  { input: "good night", expected: "UNIMPORTANT" },
  { input: "Earn money online fast!", expected: "UNIMPORTANT" },
  { input: "I am tired", expected: "UNIMPORTANT" },
  { input: "🚀🚀🚀", expected: "UNIMPORTANT" },
  { input: "Is Elon Musk alien?", expected: "UNIMPORTANT" },
  { input: "please", expected: "UNIMPORTANT" },
  { input: "ping", expected: "UNIMPORTANT" },
  { input: "I want to buy crypto", expected: "UNIMPORTANT" },
  { input: "free iphone click here", expected: "UNIMPORTANT" },
  { input: "hey", expected: "UNIMPORTANT" },
  { input: "What's up", expected: "UNIMPORTANT" },
  { input: "this is a test message", expected: "UNIMPORTANT" },
  { input: "jjjjjjjjjjjj", expected: "UNIMPORTANT" },
  { input: "hOw Do I haCk fAcEbOoK", expected: "UNIMPORTANT" }
];

async function runTests() {
  console.log("Connecting to database...");
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected. Starting tests...");

  let importantCorrect = 0;
  let moderateCorrect = 0;
  let unimportantCorrect = 0;
  let totalImportant = 35;
  let totalModerate = 30;
  let totalUnimportant = 35;

  const fs = require('fs');
  const path = require('path');
  const resultsFile = path.join(__dirname, 'test_results.md');
  
  let md = "# QA Test Report: FAQ Classification System\n\n";
  md += "| Input | Expected | System Decision | Confidence | Status |\n";
  md += "|---|---|---|---|---|\n";

  for (const tc of testCases) {
    try {
      const res = await classifyOnly({ query: tc.input, sessionId: "tester" });
      
      // Map system response to IMPORTANT / MODERATE / UNIMPORTANT
      let systemCategory = "UNIMPORTANT";
      
      if (res.status === "ok" && res.isRelevant && res.confidence >= 0.70) {
        systemCategory = "IMPORTANT";
      } else if (res.status === "ok" && res.isRelevant && res.confidence >= 0.3) {
        systemCategory = "MODERATE";
      } else if (res.isRelevant && res.confidence >= 0.3) {
        systemCategory = "MODERATE";
      } else if (res.status === "out_of_scope" && res.confidence >= 0.3) {
        systemCategory = "MODERATE";
      } else {
        systemCategory = "UNIMPORTANT";
      }

      // We'll also check if the rule-based spam filter blocked it
      const { isLikelySpam } = require('./src/utils/text');
      if (isLikelySpam(tc.input)) {
        systemCategory = "UNIMPORTANT";
      }

      let statusMarker = systemCategory === tc.expected ? "✅" : "❌";
      
      if (systemCategory === tc.expected) {
        if (tc.expected === "IMPORTANT") importantCorrect++;
        if (tc.expected === "MODERATE") moderateCorrect++;
        if (tc.expected === "UNIMPORTANT") unimportantCorrect++;
      }

      md += `| "${tc.input}" | ${tc.expected} | ${systemCategory} | ${res.confidence ? res.confidence.toFixed(2) : "0.00"} | ${statusMarker} |\n`;
      console.log(`[${statusMarker}] "${tc.input}" -> Expected: ${tc.expected}, Got: ${systemCategory} (Conf: ${res.confidence})`);
      
    } catch (e) {
      console.error("Error testing:", tc.input, e.message);
    }
  }

  md += "\n## Summary\n";
  md += `- IMPORTANT: ${importantCorrect}/${totalImportant} (${Math.round((importantCorrect/totalImportant)*100)}%)\n`;
  md += `- MODERATE: ${moderateCorrect}/${totalModerate} (${Math.round((moderateCorrect/totalModerate)*100)}%)\n`;
  md += `- UNIMPORTANT: ${unimportantCorrect}/${totalUnimportant} (${Math.round((unimportantCorrect/totalUnimportant)*100)}%)\n`;
  md += `- **OVERALL**: ${importantCorrect + moderateCorrect + unimportantCorrect}/100 (${Math.round(((importantCorrect + moderateCorrect + unimportantCorrect)/100)*100)}%)\n`;

  fs.writeFileSync(resultsFile, md);
  console.log("Tests finished. Results written to test_results.md");
  process.exit(0);
}

runTests();
