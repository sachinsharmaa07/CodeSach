import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { Problem } from './src/models/problem.model.js';
import { harnessGenerator } from './src/services/harnessGenerator.service.js';

async function main() {
  console.info('Connecting to database...', env.MONGODB_URI);
  await mongoose.connect(env.MONGODB_URI);
  console.info('Connected.');

  const problems = await Problem.find({});
  console.info(`Found ${problems.length} problems to update.`);

  for (const p of problems) {
    if (!p.parameters || p.parameters.length === 0) {
      console.info(`Skipping ${p.title}: no parameters defined.`);
      continue;
    }

    // Regenerate the harness
    const generated = harnessGenerator.generate(p.title, p.parameters, p.returnValue);

    p.harness = generated.harness;
    await p.save();
    console.info(`Updated harness for ${p.title}`);
  }

  console.info('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
