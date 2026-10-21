import { runCropHealthPipeline, CANDIDATE_MODELS } from './src/services/geminiPipeline';
import { SAMPLE_CROPS } from './src/data/sampleCrops';

async function runSampleTest(sampleId: string) {
  const sample = SAMPLE_CROPS.find((s) => s.id === sampleId);
  if (!sample) {
    throw new Error(`Sample with id "${sampleId}" not found`);
  }

  console.log('====================================================');
  console.log(`TESTING SAMPLE: ${sample.name} (${sample.cropNameId} - ${sample.issueId})`);
  console.log('Location:', sample.location);
  console.log('Candidate Models:', CANDIDATE_MODELS.join(' -> '));
  console.log('====================================================\n');

  const result = await runCropHealthPipeline(
    {
      imageBase64: sample.imageUrl,
      mimeType: 'image/svg+xml',
      cropType: sample.cropNameId,
      location: sample.location,
      coordinates: sample.coordinates,
      farmerNote: sample.noteId,
      language: 'id',
    },
    (traceUpdate) => {
      const activeStep = traceUpdate.find((s) => s.status === 'running');
      if (activeStep) {
        console.log(`--> [LIVE PROGRESS] Active agent: ${activeStep.agentName}`);
      }
    }
  );

  console.log('\n----------------------------------------------------');
  console.log(`ANALYSIS RESULT FOR: ${sample.name}`);
  console.log(`Total Duration: ${result.overallDurationMs} ms`);
  console.log('----------------------------------------------------');

  result.trace.forEach((step, idx) => {
    console.log(`Agent ${idx + 1}: ${step.agentName}`);
    console.log(`  - Status: ${step.status.toUpperCase()}`);
    console.log(`  - Model Used: ${step.modelUsed || 'N/A'}`);
    console.log(`  - Duration: ${step.durationMs} ms`);
    if (step.tokenUsage) {
      console.log(`  - Tokens: Total = ${step.tokenUsage.totalTokens} (Prompt: ${step.tokenUsage.promptTokens}, Candidates: ${step.tokenUsage.candidatesTokens}${step.tokenUsage.thoughtsTokens ? `, Thoughts: ${step.tokenUsage.thoughtsTokens}` : ''})`);
      console.log(`  - Estimated Cost: ${step.tokenUsage.estimatedCostUsd !== null && step.tokenUsage.estimatedCostUsd !== undefined ? `$${step.tokenUsage.estimatedCostUsd.toFixed(5)} USD` : 'price n/a'}`);
    } else {
      console.log('  - Tokens: N/A');
    }
    if (step.agentId === 'context') {
      const sourcesCount = step.sources ? step.sources.length : 0;
      console.log(`  - Grounding Sources Returned: ${sourcesCount > 0 ? `YES (${sourcesCount} sources)` : 'NO / Unavailable'}`);
      if (step.sources && step.sources.length > 0) {
        step.sources.forEach((src, i) => console.log(`      [${i + 1}] ${src.title} -> ${src.url}`));
      }
    }
  });

  if (result.totalTokenUsage) {
    console.log('\nTotal Tokens for Run:');
    console.log(`  Prompt: ${result.totalTokenUsage.promptTokens}, Candidates: ${result.totalTokenUsage.candidatesTokens}, Total: ${result.totalTokenUsage.totalTokens}`);
    console.log(`  Total Estimated Cost: ${result.totalEstimatedCostUsd !== null && result.totalEstimatedCostUsd !== undefined ? `$${result.totalEstimatedCostUsd.toFixed(5)} USD` : 'price n/a'}`);
  }

  console.log('\nDiagnosis Summary:');
  console.log(`  Primary: ${result.vision.primaryDiagnosis} (${(result.vision.overallConfidence * 100).toFixed(0)}% confidence)`);
  console.log(`  Disease Risk: ${result.context.diseaseRiskLevel}`);
  console.log(`  Action Plan Steps: ${result.planner.steps.length}`);
  console.log(`  Safety Warning Required: ${result.safety.warningRequired}`);
  console.log('====================================================\n');

  return result;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: No GEMINI_API_KEY found in process.env');
    process.exit(1);
  }

  console.log('Starting verification of Rice Blast and Corn Armyworm samples...\n');

  // Test 1: Rice Blast
  await runSampleTest('sample-rice-blast');

  // Test 2: Corn Armyworm
  await runSampleTest('sample-corn-armyworm');

  console.log('ALL SAMPLE VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('\nEXECUTION FAILED WITH ERROR:', err);
  process.exit(1);
});
