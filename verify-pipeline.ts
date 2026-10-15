import { runCropHealthPipeline, logStartupAvailableModels, MODEL, FALLBACK_MODEL } from './src/services/geminiPipeline';
import { SAMPLE_CROPS } from './src/data/sampleCrops';
import { GoogleGenAI } from '@google/genai';

async function main() {
  console.log('====================================================');
  console.log('RE-RUNNING "Padi Sawah / Blas Daun" SAMPLE VERIFICATION');
  console.log(`Primary MODEL: "${MODEL}"`);
  console.log(`Fallback MODEL: "${FALLBACK_MODEL}"`);
  console.log('====================================================\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: No GEMINI_API_KEY available in process.env');
    process.exit(1);
  }

  // 1. Startup check: query available models
  const ai = new GoogleGenAI({ apiKey });
  const availableModels = await logStartupAvailableModels(ai);
  console.log('\nTop 20 models available to this API key:');
  console.log(availableModels.slice(0, 20));

  // 2. Run the Padi Sawah sample
  const sample = SAMPLE_CROPS.find(s => s.id === 'sample-rice-blast');
  if (!sample) {
    console.error('ERROR: Sample not found');
    process.exit(1);
  }

  console.log('\nStarting pipeline execution with sample:', sample.name);
  console.log('Location:', sample.location);
  console.log('Note:', sample.noteId);

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
      const activeStep = traceUpdate.find(s => s.status === 'running');
      if (activeStep) {
        console.log(`--> [LIVE PROGRESS] Agent active: ${activeStep.agentName}`);
      }
    }
  );

  console.log('\n====================================================');
  console.log('PIPELINE EXECUTION COMPLETE');
  console.log(`Overall Duration: ${result.overallDurationMs} ms`);
  console.log('====================================================\n');

  result.trace.forEach((step, idx) => {
    console.log(`Step ${idx + 1}: ${step.agentName}`);
    console.log(`  - Status: ${step.status.toUpperCase()}`);
    console.log(`  - Model Used: ${step.modelUsed}`);
    console.log(`  - Duration: ${step.durationMs} ms`);
    if (step.error) {
      console.log(`  - Error: ${step.error}`);
    }
    console.log('');
  });

  console.log('Step 1 Diagnosis:', result.vision.primaryDiagnosis, `(${(result.vision.overallConfidence * 100).toFixed(0)}% confidence)`);
  console.log('Step 2 Weather Location:', result.context.weather?.locationName, `${result.context.weather?.temperature}°C, ${result.context.weather?.relativeHumidity}% humidity`);
  console.log('Step 3 Action Steps Count:', result.planner.steps.length);
  console.log('Step 4 Warning Required:', result.safety.warningRequired);
}

main().catch(err => {
  console.error('\nPIPELINE FAILED WITH ERROR:', err);
  process.exit(1);
});
