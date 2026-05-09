/**
 * Ground-truth profile for on-device QA. Keep paragraphs separated by blank lines
 * so chunking can respect model context limits.
 */
export const PERSON_CONTEXT = `
Ananth Sankaralingam is a senior Computer Science student at the University of Maryland (UMD) with a 3.8 GPA, graduating May 2026. He is a builder, published ML researcher, and musician. Contact email: ananth.sankaralingam@gmail.com. He is open to opportunities.

He is the founder of chromie.dev, a no-code platform for Chrome extensions powered by AI. It turns natural language into production-ready Chrome extensions and includes in-app browser testing with live preview and debugging.

He founded Promptly AI, a Chrome extension that automates prompt engineering across ChatGPT, Claude, Gemini, and more, with a daily-updated prompt library. Promptly AI reached about 20,000 users and was acquired.

His NeurIPS research is HashEvict: efficient LLM key-value cache compression using locality-sensitive hashing, achieving roughly 30–70% compression with minimal performance loss. The paper is on arXiv (2412.16187). He has also worked on optimal self-summarization timing in multi-turn LLM dialogues in the UMD Furong Huang Lab.

He was a Software Engineer Intern at LinkedIn from June to September 2025, working on expanding referral pipelines for two-way referrals using Apache Kafka and Samza, role analysis for Sales Navigator personas, authoring cross-functional proposals, and hackathon prototypes.

He was a Software Engineer Intern at Amazon from June to September 2024, migrating a legacy ingestion pipeline for shipping services to AWS (Glue, Kinesis, DynamoDB) with dead-letter queues and retry logic.

Since February 2024 he has been a Research Assistant at UMD in the Furong Huang Lab, co-authoring NeurIPS-accepted work on LLM KV cache compression and researching self-summarization in multi-turn conversations.

From September to December 2024 he was a Teaching Assistant at UMD for intro CS (Java), leading discussion sections for about 70 students, building a YouTube channel for supplemental content, and a TA feedback web app with Next.js and AWS Bedrock.

Projects include CMSC Infinity, an Android quiz companion for UMD CMSC 436 (Programming Handheld Systems). PolitiMeme is an ML project on political memes with an end-to-end demo. He maintains a Computer Vision Projects GitHub repository (Python, mostly minimal OpenCV). He has a YouTube channel teaching CS from Java and data structures to AI agents and system design, with 45+ videos.

Writing includes a UMD CS article (January 2025) on balancing innovation, research, and entrepreneurship; Medium posts such as "Multitasking in an AI-driven World" (November 2025) and "The Future of Browsing" (April 2026).

Beyond code: he plays mridangam (South Indian percussion) and trumpet, with performances and teaching content on YouTube. He plays basketball and soccer and completed a Half Ironman triathlon (70.3 miles: swim, bike, run). GitHub: AnanthSankaralingam. LinkedIn: ananth-s. YouTube: @ananthsankaralingam.
`.trim();
