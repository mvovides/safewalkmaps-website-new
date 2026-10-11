import { useEffect, useState } from 'react';

import { exportFileName, toCss, toJson, toTypeScript, type ExportFormat } from '@/theme/export';

import { useActiveConfig } from '../store/hooks';
import { copyText, downloadText } from './download';

const FORMATS: Array<{ id: ExportFormat; label: string; mime: string }> = [
  { id: 'json', label: 'JSON', mime: 'application/json' },
  { id: 'css', label: 'CSS', mime: 'text/css' },
  { id: 'ts', label: 'TypeScript', mime: 'text/typescript' },
];

export function ExportDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const config = useActiveConfig();
  const [format, setFormat] = useState<ExportFormat>('json');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const text =
    format === 'json' ? toJson(config) : format === 'css' ? toCss(config) : toTypeScript(config);
  const current = FORMATS.find((f) => f.id === format) ?? FORMATS[0]!;
  const fileName = exportFileName(config, format);

  return (
    <div className="pg-overlay" role="presentation" onClick={onClose}>
      <div
        className="pg-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Export ${config.meta.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div role="tablist" aria-label="Export format" className="pg-tabs">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              role="tab"
              type="button"
              aria-selected={format === f.id}
              className="pg-tab"
              onClick={() => {
                setFormat(f.id);
                setCopied(false);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <textarea
          className="pg-code"
          readOnly
          value={text}
          aria-label={`${current.label} export`}
        />
        <div className="pg-dialog-actions">
          <button
            type="button"
            className="pg-button"
            onClick={async () => {
              setCopied(await copyText(text));
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            className="pg-button"
            onClick={() => downloadText(fileName, text, current.mime)}
          >
            Download {fileName}
          </button>
          <button type="button" className="pg-button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="pg-hint">
          JSON is the canonical format and re-imports. CSS is the :root block for
          src/styles/index.css. TypeScript drops into src/theme/presets/. See
          docs/theme-playground.md for applying a preset.
        </p>
      </div>
    </div>
  );
}
