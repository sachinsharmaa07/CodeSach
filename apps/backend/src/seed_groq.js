import mongoose from 'mongoose';
import { Problem } from './models/problem.model.js';
import dotenv from 'dotenv';
import { generateProblemDetails } from './services/ai.service.js';
import { harnessGenerator } from './services/harnessGenerator.service.js';

// Setup environment and database
dotenv.config({ path: '../../.env' });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codesach';

async function seedMissingGroqDetails() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.info('Connected to MongoDB.');

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing in your .env file!');
      process.exit(1);
    }

    // Find problems where the description has "placeholder description", test cases are <= 1, or missing a harness
    const problemsToUpdate = await Problem.find({
      $or: [
        { description: /placeholder description/i },
        { testCases: { $size: 1 } },
        { description: { $exists: false } },
        { harness: { $exists: false } },
        { 'harness.javascript': { $exists: false } },
        { parameters: { $exists: false } },
        { parameters: { $size: 0 } },
      ],
    });

    console.info(`Found ${problemsToUpdate.length} problems requiring Groq AI generation.`);

    for (let i = 0; i < problemsToUpdate.length; i++) {
      const p = problemsToUpdate[i];
      console.info(`[${i + 1}/${problemsToUpdate.length}] Generating details for: ${p.title}...`);

      try {
        const details = await generateProblemDetails(p.title);

        // Update problem
        p.description = details.description || p.description;
        p.testCases =
          details.testCases && details.testCases.length > 0 ? details.testCases : p.testCases;
        if (details.parameters) p.parameters = details.parameters;
        if (details.returnValue) p.returnValue = details.returnValue;
        if (details.aiSolutions) p.aiSolutions = details.aiSolutions;

        // Use our deterministic code generator instead of relying on AI hallucinations
        const { starterCode, harness } = harnessGenerator.generate(
          p.title,
          p.parameters,
          p.returnValue,
        );
        p.starterCode = starterCode;
        p.harness = harness;

        await p.save();
        console.info(`✅ Successfully updated ${p.title}`);

        // Sleep for 3 seconds to avoid Groq Rate Limits
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (err) {
        console.error(`❌ Failed to update ${p.title}:`, err.message);
      }
    }

    console.info('Finished updating problems via Groq.');
    process.exit(0);
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

seedMissingGroqDetails();
