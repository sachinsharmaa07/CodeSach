import mongoose from 'mongoose';
import { Groq } from 'groq-sdk';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const groq = new Groq({ apiKey: GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

const problemSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  difficulty: String,
  category: String,
  marks: Number,
  testCases: [{ input: String, expectedOutput: String, isHidden: Boolean }]
});
const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function generateBatch(startIdx, endIdx) {
  const prompt = `
Generate a JSON array of exactly ${endIdx - startIdx + 1} coding problems. These should be the problems ranked ${startIdx} to ${endIdx} in the "most solved LeetCode problems" list.
Return ONLY raw JSON, with no markdown formatting, no backticks, just the JSON array.
Each object must have:
- "title": String (e.g. "Two Sum")
- "description": String (A very detailed description of the problem, with input/output format, constraints, and an explanation on how the input should be read from standard input in JS/Python/C++)
- "difficulty": "easy", "medium", or "hard"
- "category": "array", "string", "math", "dp", etc.
- "marks": Number (e.g. 10 for easy, 20 for medium, 30 for hard)
- "testCases": Array of 4 test cases. Each test case has "input" (String, mimicking standard input exactly), "expectedOutput" (String), and "isHidden" (Boolean, last 2 should be true).

IMPORTANT: The "input" string MUST be plain text exactly as it would appear in a file read by \`fs.readFileSync(0, 'utf-8')\`. Do NOT use JSON representation for inputs unless the problem is about parsing JSON. For example, for Two Sum, input could be:\n3\n2 7 11 15\n9\n(where 3 is length of array, next line is array, next line is target).
`;

  console.log(`Generating problems ${startIdx} to ${endIdx}...`);
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
    temperature: 0.2,
  });

  const responseText = completion.choices[0]?.message?.content || '[]';
  
  // Clean up any potential markdown formatting
  let jsonString = responseText.trim();
  if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
  if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
  if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);

  try {
    const problems = JSON.parse(jsonString.trim());
    return problems.map(p => ({
      ...p,
      slug: slugify(p.title)
    }));
  } catch (e) {
    console.error("Failed to parse JSON for batch:", e.message);
    console.error("Raw response:", responseText);
    return [];
  }
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Optionally clear existing problems
    // await Problem.deleteMany({});
    // console.log('Cleared existing problems');

    let allProblems = [];
    
    // Generate 5 batches of 10 to get 50 problems
    for (let i = 0; i < 5; i++) {
      const start = i * 10 + 1;
      const end = (i + 1) * 10;
      const batch = await generateBatch(start, end);
      allProblems.push(...batch);
      // Slight delay to respect rate limits
      await new Promise(r => setTimeout(r, 2000));
    }

    if (allProblems.length > 0) {
      // Avoid duplicate slugs
      const uniqueProblems = [];
      const seen = new Set();
      for (const p of allProblems) {
        if (!seen.has(p.slug)) {
          seen.add(p.slug);
          uniqueProblems.push(p);
        }
      }

      await Problem.insertMany(uniqueProblems);
      console.log(`🎉 Successfully seeded ${uniqueProblems.length} LeetCode problems!`);
    } else {
      console.log('❌ Failed to generate any problems.');
    }

  } catch (error) {
    console.error('Error seeding DB:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

seed();
