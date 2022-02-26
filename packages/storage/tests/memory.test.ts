import { expect } from 'chai';

describe('Simple addition', () => { // the tests container
    it('it should properly add', async () => {
        expect(1 + 2).to.be.equals(3)
    });
});