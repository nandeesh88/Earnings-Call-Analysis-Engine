import { useState } from 'react';

interface UploadProps {
  onResult: (data: unknown) => void;
  onError: (msg: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function Upload({ onResult, onError, onLoading }: UploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function submitFile(file: File) {
    setFileName(file.name);
    onLoading(true);
    onError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/analyze', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || 'Analysis failed');
        onResult(null);
      } else {
        onResult(json);
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Network error');
      onResult(null);
    } finally {
      onLoading(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) submitFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) submitFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
      }`}
    >
      <div className="mb-3">
        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        Drop earnings call transcript here, or{' '}
        <label className="text-blue-600 cursor-pointer hover:underline font-medium">
          browse
          <input type="file" accept=".pdf,.txt" onChange={handleFile} className="hidden" />
        </label>
      </p>
      <p className="text-xs text-gray-400">PDF or TXT — minimum 800 characters</p>
      {fileName && <p className="text-xs text-gray-500 mt-2">Selected: {fileName}</p>}
    </div>
  );
}
