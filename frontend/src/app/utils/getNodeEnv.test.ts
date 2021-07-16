import getNodeEnv from './env';

describe('getNodeEnv', () => {
    it('returns the node env', () => {
        expect(getNodeEnv()).toEqual(process.env.NODE_ENV);
    });
})