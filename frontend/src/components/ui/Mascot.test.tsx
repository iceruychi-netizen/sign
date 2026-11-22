import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CatEars, Mascot } from './Mascot';

describe('Mascot', () => {
  it('renders the chosen pose as a decorative image hidden from screen readers', () => {
    const { container } = render(<Mascot pose="wave" motion="sway" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/mascot/wave.png');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('aria-hidden', 'true');
    expect(img?.className).toContain('mascot-sway');
  });

  it('cat ears are purely decorative', () => {
    const { container } = render(<CatEars />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
