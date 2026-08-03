import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Problem } from './src/models/problem.model.js';

dotenv.config({ path: '.env' });

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const problem = await Problem.findOne({}).lean();
    if (!problem) {
      console.log('No problems found in DB.');
      process.exit(0);
    }

    console.log('\n--- Checking DB Format for Problem:', problem.title, '---\n');

    console.log('1. Parameters Format (Should be array of objects):');
    console.log(JSON.stringify(problem.parameters, null, 2));

    console.log('\n2. Return Value Format (Should be object):');
    console.log(JSON.stringify(problem.returnValue, null, 2));

    console.log('\n3. AI Solutions Format (Should be object with bruteForce, better, optimal):');
    console.log(JSON.stringify(problem.aiSolutions, null, 2));

    console.log('\n4. Starter Code & Harness Format (Should be object with languages as keys):');
    console.log('Starter Code Keys:', Object.keys(problem.starterCode || {}));
    console.log('Harness Keys:', Object.keys(problem.harness || {}));

    console.log('\n✅ DB format check complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDB();
