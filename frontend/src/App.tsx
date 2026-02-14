import { useState } from 'react';
import Upload from './Upload';
import Dashboard from './Dashboard';
import type { AnalysisResult } from './types';

export default function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">Earnings Call Analysis Engine</h1>
            <p className="text-xs text-gray-500">Institutional equity research — structured transcript analysis</p>
          </div>
          {result && (
            <button
              onClick={() => { setResult(null); setError(''); }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              New Analysis
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {!result && !loading && (
          <div className="max-w-xl mx-auto">
            <Upload
              onResult={(d) => setResult(d as AnalysisResult)}
              onError={setError}
              onLoading={setLoading}
            />
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full mb-4" />
            <p className="text-sm text-gray-600">Analyzing transcript...</p>
            <p className="text-xs text-gray-400 mt-1">Extracting text, running LLM analysis, validating schema</p>
          </div>
        )}

        {result && <Dashboard data={result} />}
      </main>
    </div>
  );
}
