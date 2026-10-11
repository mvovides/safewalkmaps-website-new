import { useState } from 'react';

import { parseThemeConfig } from '@/theme/validate';

import { usePlaygroundActions } from '../store/hooks';

export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { importConfig } = usePlaygroundActions();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  if (!open) return null;

  const submit = () => {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      setErrors(['Not valid JSON.']);
      return;
    }
    const result = parseThemeConfig(data);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    importConfig(result.config);
    setText('');
    setErrors([]);
    onClose();
  };
  const onFile = (file: File | undefined) => {
    if (file) void file.text().then(setText);
  };

  return (
    <div className="pg-overlay" role="presentation" onClick={onClose}>
      <div
        className="pg-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Import a preset"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="pg-field-label" htmlFor="pg-import-file">
          Choose a JSON file
        </label>
        <input
          id="pg-import-file"
          type="file"
          accept="application/json,.json"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <label className="pg-field-label" htmlFor="pg-import-text">
          Or paste the JSON
        </label>
        <textarea
          id="pg-import-text"
          className="pg-code"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {errors.length > 0 && (
          <ul role="alert" className="pg-errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
        <div className="pg-dialog-actions">
          <button type="button" className="pg-button" onClick={submit}>
            Import preset
          </button>
          <button type="button" className="pg-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
