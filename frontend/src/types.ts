export interface ForwardGuidance {
  revenue: string;
  margins: string;
  capex: string;
}

export interface SupportingQuote {
  quote: string;
  section: string;
}

export interface AnalysisMeta {
  analyzed_at: string;
  transcript_chars: number;
  truncated: boolean;
  model: string;
}

export interface AnalysisResult {
  company_name: string;
  call_date: string;
  management_tone: string;
  confidence_level: string;
  key_positives: string[];
  key_concerns: string[];
  forward_guidance: ForwardGuidance;
  capacity_utilization: string;
  growth_initiatives: string[];
  working_capital_commentary: string;
  governance_or_accounting_flags: string[];
  supporting_quotes: SupportingQuote[];
  _meta: AnalysisMeta;
}
