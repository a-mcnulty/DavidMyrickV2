#!/usr/bin/env node
import { createClient } from '@sanity/client';

const DRY_RUN = process.argv.includes('--dry-run');
const DATASET = process.argv.includes('--staging') ? 'staging' : 'production';

const client = createClient({
  projectId: 'cd3com2c',
  dataset: DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
});

async function migrate() {
  console.log(`\n=== Subcategory → Tile Description Migration ===`);
  console.log(`Dataset: ${DATASET}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}\n`);

  const projects = await client.fetch(
    `*[_type == "project"]{ _id, title, subcategory }`
  );

  console.log(`Found ${projects.length} projects.\n`);

  let migrated = 0;
  let skippedRef = 0;
  let skippedNull = 0;

  for (const project of projects) {
    const { _id, title, subcategory } = project;

    if (subcategory === null || subcategory === undefined) {
      skippedNull++;
      continue;
    }

    if (typeof subcategory === 'object' && subcategory._ref) {
      skippedRef++;
      console.log(`  SKIP (reference): "${title}" → already a subcategory reference`);
      continue;
    }

    if (typeof subcategory === 'string') {
      console.log(`  MIGRATE: "${title}" → tileDescription = "${subcategory}"`);
      migrated++;

      if (!DRY_RUN) {
        await client
          .patch(_id)
          .set({ tileDescription: subcategory })
          .unset(['subcategory'])
          .commit();
      }
      continue;
    }

    console.log(`  UNKNOWN: "${title}" → subcategory type: ${typeof subcategory}`, subcategory);
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Migrated:            ${migrated}`);
  console.log(`  Skipped (reference): ${skippedRef}`);
  console.log(`  Skipped (empty):     ${skippedNull}`);
  console.log(`  Total:               ${projects.length}`);

  if (DRY_RUN && migrated > 0) {
    console.log(`\nRe-run without --dry-run to apply changes.`);
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
