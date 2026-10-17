import '../css/inline-loader.css';

export default function InlineLoader({ text = 'Loading...', className = '' }) {
  return (
    <div className={`inline-loader ${className}`.trim()} role="status" aria-live="polite" aria-busy="true">
      <span className="inline-loader-spinner" aria-hidden="true" />
      {text && <span className="inline-loader-text">{text}</span>}
    </div>
  );
}
