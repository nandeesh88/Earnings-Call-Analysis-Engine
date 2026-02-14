import type { AnalysisResult } from './types';
import { useState } from 'react';

function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded border ${colors[color] || colors.gray}`}>
      {label}
    </span>
  );
}

function toneColor(tone: string) {
  if (tone === 'Optimistic') return 'green';
  if (tone === 'Cautious' || tone === 'Pessimistic') return 'red';
  return 'yellow';
}

function confidenceColor(c: string) {
  if (c === 'High') return 'green';
  if (c === 'Low') return 'red';
  return 'yellow';
}

function guidanceColor(v: string) {
  if (v === 'Explicit') return 'text-emerald-700 bg-emerald-50';
  if (v === 'Vague') return 'text-amber-700 bg-amber-50';
  return 'text-gray-500 bg-gray-50';
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-200 pb-1">{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard({ data }: { data: AnalysisResult }) {
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-t-lg p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{data.company_name}</h2>
            <p className="text-sm text-gray-500">Call Date: {data.call_date}</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Analyzed: {new Date(data._meta.analyzed_at).toLocaleString()}</p>
            <p>Model: {data._meta.model} · {data._meta.transcript_chars.toLocaleString()} chars{data._meta.truncated ? ' (truncated)' : ''}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          <Badge label={`Tone: ${data.management_tone}`} color={toneColor(data.management_tone)} />
          <Badge label={`Confidence: ${data.confidence_level}`} color={confidenceColor(data.confidence_level)} />
          <Badge label={`Capacity: ${data.capacity_utilization}`} color={data.capacity_utilization === 'Improving' ? 'green' : data.capacity_utilization === 'Declining' ? 'red' : 'gray'} />
          <Badge label={`Working Capital: ${data.working_capital_commentary}`} color={data.working_capital_commentary === 'Elevated' ? 'red' : data.working_capital_commentary === 'Improving' ? 'green' : 'gray'} />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-x border-gray-200">
        {/* Left column */}
        <div className="p-5 border-b lg:border-r border-gray-200">
          <Section title="Key Positives">
            <ul className="space-y-1.5">
              {data.key_positives.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                  <span className="text-emerald-500 mt-0.5 shrink-0">▲</span>
                  {p}
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Growth Initiatives">
            <ul className="space-y-1.5">
              {data.growth_initiatives.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                  <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                  {g}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Right column */}
        <div className="p-5 border-b border-gray-200">
          <Section title="Key Concerns">
            <ul className="space-y-1.5">
              {data.key_concerns.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                  <span className="text-red-500 mt-0.5 shrink-0">▼</span>
                  {c}
                </li>
              ))}
            </ul>
          </Section>
          {data.governance_or_accounting_flags.length > 0 && (
            <Section title="Governance / Accounting Flags">
              <ul className="space-y-1.5">
                {data.governance_or_accounting_flags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                    <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                    {f}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>

      {/* Forward Guidance table */}
      <div className="border-x border-b border-gray-200 p-5">
        <Section title="Forward Guidance">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="pb-2 font-medium">Metric</th>
                <th className="pb-2 font-medium">Classification</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.forward_guidance).map(([key, val]) => (
                <tr key={key} className="border-t border-gray-100">
                  <td className="py-2 font-medium text-gray-700 capitalize">{key}</td>
                  <td className="py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${guidanceColor(val)}`}>
                      {val}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {/* Supporting Quotes */}
      {data.supporting_quotes.length > 0 && (
        <div className="border-x border-b border-gray-200 p-5">
          <Section title="Supporting Quotes">
            <div className="space-y-3">
              {data.supporting_quotes.map((q, i) => (
                <blockquote key={i} className="border-l-2 border-gray-300 pl-3 text-sm text-gray-700 italic">
                  "{q.quote}"
                  <span className="block text-xs text-gray-400 mt-1 not-italic">— {q.section}</span>
                </blockquote>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* JSON toggle */}
      <div className="border-x border-b border-gray-200 rounded-b-lg p-4">
        <button
          onClick={() => setShowJson(!showJson)}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
        >
          {showJson ? 'Hide' : 'Show'} Raw JSON
        </button>
        {showJson && (
          <pre className="mt-3 bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-auto max-h-96 text-gray-700">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
