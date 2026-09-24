import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '../src';

const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

function Playground() {
  const [loading, setLoading] = useState(false);

  const simulateSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24, display: 'grid', gap: 24, maxWidth: 640 }}>
      <h1>Button</h1>

      {variants.map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {sizes.map((size) => (
            <Button key={size} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
          <Button variant={variant} disabled>
            Disabled
          </Button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 12 }}>
        <Button leftIcon={<span>←</span>}>Back</Button>
        <Button variant="secondary" rightIcon={<span>→</span>}>
          Next
        </Button>
        <Button loading={loading} onClick={simulateSave}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <Button fullWidth size="lg">
        Full width
      </Button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);
