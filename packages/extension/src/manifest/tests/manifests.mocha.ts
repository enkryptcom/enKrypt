import BaseManifest from '../manifest.base';
import { expect } from 'chai';

describe('Various tests related to manifest', () => {
  it('should have correct lengths', async () => {
    expect(BaseManifest.name.length).to.be.lessThanOrEqual(45);
  });
});
