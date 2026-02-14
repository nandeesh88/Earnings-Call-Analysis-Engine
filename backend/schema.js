const TONE_VALUES = ['Optimistic', 'Neutral', 'Cautious', 'Pessimistic'];
const CONFIDENCE_VALUES = ['High', 'Medium', 'Low'];
const GUIDANCE_VALUES = ['Explicit', 'Vague', 'Not Mentioned'];
const CAPACITY_VALUES = ['Improving', 'Stable', 'Declining', 'Not Mentioned'];
const WORKING_CAPITAL_VALUES = ['Improving', 'Elevated', 'Stable', 'Not Mentioned'];
const QUOTE_SECTIONS = ['Management Commentary', 'Q&A'];

function enforceEnum(value, allowed, fallback) {
  if (allowed.includes(value)) return value;
  // Try case-insensitive match
  const match = allowed.find(a => a.toLowerCase() === String(value || '').toLowerCase());
  return match || fallback;
}

function enforceStringArray(val, fallback = []) {
  if (!Array.isArray(val)) return fallback;
  return val.filter(item => typeof item === 'string' && item.trim().length > 0);
}

export function validateAndNormalize(raw) {
  const result = {};

  result.company_name = typeof raw.company_name === 'string' && raw.company_name.trim()
    ? raw.company_name.trim() : 'Not Mentioned';

  result.call_date = typeof raw.call_date === 'string' && raw.call_date.trim()
    ? raw.call_date.trim() : 'Not Mentioned';

  result.management_tone = enforceEnum(raw.management_tone, TONE_VALUES, 'Neutral');
  result.confidence_level = enforceEnum(raw.confidence_level, CONFIDENCE_VALUES, 'Medium');

  result.key_positives = enforceStringArray(raw.key_positives, ['No specific positives identified']);
  result.key_concerns = enforceStringArray(raw.key_concerns, ['No specific concerns identified']);

  // Forward guidance
  const fg = raw.forward_guidance && typeof raw.forward_guidance === 'object' ? raw.forward_guidance : {};
  result.forward_guidance = {
    revenue: enforceEnum(fg.revenue, GUIDANCE_VALUES, 'Not Mentioned'),
    margins: enforceEnum(fg.margins, GUIDANCE_VALUES, 'Not Mentioned'),
    capex: enforceEnum(fg.capex, GUIDANCE_VALUES, 'Not Mentioned'),
  };

  result.capacity_utilization = enforceEnum(raw.capacity_utilization, CAPACITY_VALUES, 'Not Mentioned');
  result.growth_initiatives = enforceStringArray(raw.growth_initiatives, ['Not Mentioned']);
  result.working_capital_commentary = enforceEnum(raw.working_capital_commentary, WORKING_CAPITAL_VALUES, 'Not Mentioned');
  result.governance_or_accounting_flags = enforceStringArray(raw.governance_or_accounting_flags, []);

  // Supporting quotes
  if (Array.isArray(raw.supporting_quotes)) {
    result.supporting_quotes = raw.supporting_quotes
      .filter(q => q && typeof q.quote === 'string' && q.quote.trim())
      .map(q => ({
        quote: q.quote.trim(),
        section: enforceEnum(q.section, QUOTE_SECTIONS, 'Management Commentary'),
      }));
  } else {
    result.supporting_quotes = [];
  }

  return result;
}
