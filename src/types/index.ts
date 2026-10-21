export type Language = 'id' | 'en';

export interface CropIssue {
  name: string;
  scientificName?: string;
  confidence: number; // 0 to 1
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  description: string;
}

export interface VisionHypothesis {
  name: string;
  scientificName?: string;
  confidence: number; // 0 to 1
  symptoms_seen: string[];
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface VisionDiagnosisResult {
  crop: string;
  cropScientificName?: string;
  primaryDiagnosis: string;
  primaryScientificName?: string;
  overallConfidence: number; // 0 to 1
  image_quality: 'good' | 'poor' | 'not_a_plant';
  isHealthy?: boolean;
  hypotheses: VisionHypothesis[];
  issues: CropIssue[];
  visualObservations: string[];
  reasoning: string;
}

export interface WeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  temperature: number;
  relativeHumidity: number;
  precipitation: number;
  precipitationProbability?: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number;
  forecast?: {
    day: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
  }[];
}

export interface ContextResult {
  weather: WeatherData | null;
  diseaseRiskLevel: 'low' | 'moderate' | 'high' | 'severe';
  diseaseRiskFactors: string[];
  microclimateSummary: string;
  regionalAgroAdvisory: string;
  groundingSources?: { title: string; url: string }[];
}

export interface PlanStep {
  stepNumber: number;
  timeFrame: string; // e.g. "Segera (Hari 1)" or "Immediate (Day 1)"
  title: string;
  description: string;
  category: 'organic' | 'cultural' | 'biological' | 'low_cost' | 'chemical';
  estimatedCost: 'free' | 'low' | 'moderate';
  materialsNeeded: string[];
  applicationMethod?: string;
}

export interface PlannerResult {
  strategyOverview: string;
  organicPriorityExplanation: string;
  steps: PlanStep[];
  containsChemicals: boolean;
  estimatedRecoveryTime: string;
}

export interface SafetyCheckResult {
  warningRequired: boolean;
  reasons: string[];
  confidenceTooLow: boolean;
  containsChemicals: boolean;
  extensionOfficerAdvisory: string; // PPL advisory
  ppeRequired: string[];
  environmentalPrecautions: string[];
  preHarvestIntervalDays?: number;
  criticalNotice?: string;
}

export interface TokenUsage {
  promptTokens: number;
  candidatesTokens: number;
  thoughtsTokens?: number;
  totalTokens: number;
  estimatedCostUsd?: number | null; // null if model pricing is not published ("price n/a")
}

export interface AgentTraceStep {
  agentId: 'vision' | 'context' | 'planner' | 'safety';
  agentName: string;
  agentRole: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  durationMs: number;
  timestamp: string;
  thoughtProcess: string;
  modelUsed?: string;
  tokenUsage?: TokenUsage;
  toolCalls?: {
    toolName: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  }[];
  rawOutput?: Record<string, unknown>;
  error?: string;
  sources?: { title: string; url: string }[];
  groundingStatus?: string;
}

export interface FullAnalysisResponse {
  success: boolean;
  language: Language;
  vision: VisionDiagnosisResult;
  context: ContextResult;
  planner: PlannerResult;
  safety: SafetyCheckResult;
  trace: AgentTraceStep[];
  overallDurationMs: number;
  totalTokenUsage?: TokenUsage;
  totalEstimatedCostUsd?: number | null;
  timestamp: string;
  isMockFallback?: boolean;
  error?: string;
}

export interface SampleCrop {
  id: string;
  name: string;
  cropType: string;
  cropNameId: string;
  cropNameEn: string;
  issueId: string;
  issueEn: string;
  location: string;
  coordinates: { lat: number; lon: number };
  noteId: string;
  noteEn: string;
  imageUrl: string;
  thumbnailUrl: string;
}
