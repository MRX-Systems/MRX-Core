import { Hash } from '../../../Source/Common/Tools';

describe('Hash', () => {
    it('should hash data', () => {
        const data = 'Hello, World!';
        expect(Hash.md5(data)).toBe('65a8e27d8879283831b664bd8b7f0ad4');
        expect(Hash.sha256(data)).toBe('dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f');
        expect(Hash.sha512(data)).toBe('374d794a95cdcfd8b35993185fef9ba368f160d8daf432d08ba9f1ed1e5abe6cc69291e0fa2fe0006a52570ef18c19def4e617c33ce52ef0a6e5fbe318cb0387');
    });

    it ('should hash data with different types', () => {
        const data = { hello: 'world' };
        expect(Hash.md5(data)).toBe('fbc24bcc7a1794758fc1327fcfebdaf6');
        expect(Hash.sha256(data)).toBe('93a23971a914e5eacbf0a8d25154cda309c3c1c72fbb9914d47c60f3cb681588');
        expect(Hash.sha512(data)).toBe('f8fb68902347a2c828d38c30e1c361778c89c613232f35a30c02ad2b04190d3e047fdbff3eb4bff8140b5f8217e5d66450c2bfb50a3b53273af1192137209956');
    });
});