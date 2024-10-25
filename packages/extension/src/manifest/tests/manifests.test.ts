import { describe, it, expect } from 'vitest';
import BaseManifest from '../manifest.base';

describe('Various tests related to manifest', () => {
  it('should have correct lengths', async () => {
    expect(BaseManifest.name.length).to.be.lessThanOrEqual(45);
  });
});
