# Samagama FAQ System - Product Requirements Document (PRD)

## 1. Executive Overview
Samagama is a comprehensive, AI-enhanced FAQ and Community Q&A platform tailored for college and internship programs (e.g., Vicharanashala, IIT Ropar). It bridges the gap between static knowledge bases and dynamic community support by offering an AI assistant (Yaksha) that attempts to answer user queries using a vector-embedded FAQ corpus. If the AI cannot confidently answer the query, it seamlessly escalates the question to a community board where peer users (Answerers) can respond. An administrative moderation layer ensures content quality, leverages AI to cluster recurring community questions, and synthesizes them into "Master FAQs" to continuously enrich the knowledge base.

## 2. Project Goals & Purpose
* **Instant Support:** Provide fast, accurate, and context-aware answers to student/participant queries using AI.
* **Community Engagement:** Foster peer-to-peer assistance when the AI cannot resolve complex or edge-case questions.
* **Knowledge Evolution:** Automatically identify recurring community questions and use AI to synthesize them into permanent FAQ entries.
* **Gamification & Quality Control:** Award Skill Points (SP) / Experience (XP) to users for contributing quality answers, while providing admins with robust moderation tools to filter abuse.

## 3. Target Users
1. **Askers (Students/Participants):** Users who search the FAQ, interact with the Yaksha AI assistant, and post questions to the community if unresolved.
2. **Answerers (Peers/Mentors):** Users who browse open community questions, provide answers, and earn SP/XP for approved and promoted contributions.
3. **Administrators (Moderators):** Staff who monitor analytics, moderate flagged answers, approve AI-synthesized Master FAQs, manage the FAQ corpus, and adjust user SP balances.

## 4. Key User Journeys
* **Query Flow:** User submits a query -> AI validates for abuse/gibberish -> AI embeds query -> Semantic Cache checked -> Hybrid Search (Vector + Keyword) on FAQ corpus -> If match > 40% confidence, AI synthesizes answer -> If < 40%, escalates to Community Board.
* **Community Q&A Flow:** Asker posts question -> Answerer submits answer -> Answer undergoes AI ethical/relevance check -> If flagged, sent to Admin Moderation; else, goes Live -> Community upvotes/downvotes answer.
* **Moderation & Knowledge Loop:** Admin reviews flagged answers (Approve/Reject) -> Admin views highly upvoted answers as "FAQ Proposals" -> Admin triggers "Global AI Cluster" -> Groq LLM clusters semantic duplicates and writes a Master FAQ -> Admin approves Master FAQ -> Knowledge Base is updated and original answers marked as promoted.

## 5. Technical Architecture & Dependencies
### Tech Stack
* **Frontend (Client):** React 19, Vite, React Router DOM, Axios, Vanilla CSS.
* **Frontend (Admin):** React 19, Vite, TailwindCSS v4 (Inconsistency with Client), React Icons.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (via Mongoose), utilizing Atlas Vector Search for semantic queries.
* **AI & Inference:** 
  * `groq-sdk` (Llama-3.1-8b-instant) for query classification, rephrasing, answering, clustering, and moderation.
  * `@xenova/transformers` (Local) for generating 384-dimensional vector embeddings without API costs.

### Database Models
* `User`: Stores user details, role (asker, answerer, admin), and SP/XP points.
* `FAQ` & `FAQCategory`: The core knowledge base, storing questions, answers, category paths, and vector embeddings.
* `Question` & `Answer`: Community Q&A entities tracking upvotes, status (open, answered, live, flagged), and AI-checks.
* `SemanticCache`: Caches recent AI synthesized responses to save API tokens on duplicate queries.
* `Vote`: Tracks upvotes/downvotes to prevent duplicate voting.

## 6. Functional Requirements (Function-by-Function Analysis)

### Backend Services & Controllers
* **`yaksha.js` (AI Pipeline)**
  * `runYakshaPipeline`: Orchestrates caching, query condensation, vector embedding, hybrid search, and Groq synthesis. Escalates to community if confidence < 40%. *(Working as intended, highly robust).*
  * `hybridSearch`: Combines MongoDB Atlas Vector Search (70% weight) with exact keyword match logic (30% weight). *(Well-implemented fallback mechanisms).*
  * `checkSemanticCache`: Vector searches recent queries with >95% similarity to bypass LLM generation. *(Good optimization).*
* **`groq.js` (LLM Integration)**
  * `parseYakshaResponse`: Uses regex and JSON parsing to extract answers from sometimes-malformed LLM outputs. *(Complex but necessary due to LLM hallucinations).*
  * `classifyQuery`: Validates queries (VALID, ABUSIVE, GIBBERISH).
  * `synthesizeAnswer`: Generates context-aware responses from FAQ snippets using strict prompting.
  * `clusterQuestions`: Groups community questions and generates Master FAQs. *(Currently limits input to 10 questions to avoid Groq TPM limits—potential scalability issue).*
* **`adminService.js` & `adminController.js`**
  * `getDashboard` & `getAnalytics`: Fetches overview stats. *(Issue: `pendingFaqProposals` is mocked to equal flagged answers, and `categoryDistribution` is an empty array).*
  * `approveAnswer` & `promoteAnswer`: Grants customizable XP/SP to Askers and Answerers. 
  * `globalAiCluster` & `createMasterFaq`: Generates and saves AI-clustered Master FAQs. *(Issue resolved: `FAQ.js` model previously lacked `ai_master` in the source enum, causing 400 Bad Request errors).*

### Frontend Components
* **Client App:**
  * `FAQPage.jsx` / `FAQBrowse.jsx`: Interface for searching FAQs and chatting with Yaksha.
  * `CommunityBoard.jsx`: Displays open questions for users to answer.
  * `AnswererDashboard.jsx`: Dedicated view for users to track their submitted answers and earned SP.
* **Admin App:**
  * `AdminModeration.jsx`: Tabbed interface for reviewing flagged answers, FAQ proposals, and triggering the Global AI Cluster.
  * `AdminFAQs.jsx` & `AdminUsers.jsx`: CRUD interfaces for managing the knowledge base and adjusting user SP balances manually.

## 7. Edge Cases & Inconsistencies

### Missing or Broken Parts
1. **Mocked Analytics Data:** `getAnalytics` in `adminService.js` returns hardcoded `avgConfidence` (0.85) and an empty `categoryDistribution` array. `pendingFaqProposals` in the dashboard simply duplicates the flagged answer count.
2. **Groq Token Limits:** The `globalAiCluster` limits processing to only 10 community questions at a time to prevent exceeding Groq's 6000 TPM limit. In a highly active community, this will cause a massive backlog of unclustered questions.
3. **Frontend Styling Inconsistency:** The Client application utilizes standard Vanilla CSS, whereas the newly built Admin panel uses Tailwind CSS v4. This creates a fragmented design system and code maintenance overhead.
4. **Answer Validation Fallback:** If the `checkAnswer` AI validation fails due to network issues, it defaults to `passes: true` to avoid blocking users. This could potentially allow abusive content to bypass immediate moderation if the LLM is down.

### Edge Cases Handled Well
* **Malformed JSON from LLM:** `parseYakshaResponse` aggressively cleans and recovers JSON from markdown blocks and syntax errors.
* **Database Failures during Search:** `hybridSearch` gracefully falls back to searching the 'root' category if category-specific vector search fails.

## 8. Recommendations & Improvements

1. **Implement Real Analytics:** Replace the mocked analytics in `adminService.js` with actual MongoDB aggregation pipelines (e.g., calculating average confidence from the `SemanticCache` and grouping queries by category).
2. **Batch AI Clustering:** To bypass the Groq 10-question limit, implement a background cron job (or queue system like BullMQ) that processes community questions in small, rate-limited batches overnight, rather than attempting to cluster them all synchronously via an Admin API call.
3. **Unify the Frontend Stack:** Migrate the Client application to Tailwind CSS (or migrate Admin to Vanilla CSS) to establish a single, cohesive design system across the entire monorepo.
4. **Enhanced Caching:** Ensure the `SemanticCache` TTL index is properly configured in MongoDB to automatically drop entries older than 30 days to save storage space, as the code relies on the database to handle expiration.
5. **Add Webhooks/Notifications:** Implement a notification system to alert users when their community answer gets approved, flagged, or promoted to the FAQ corpus, enhancing the gamification experience.
