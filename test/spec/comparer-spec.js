import { compareAscBy, compareDescBy, greater, lesser } from '../../src/comparer';

describe('comparer', () => {
    describe('compares asc by props', () => {
        it('returns -1 if x is smaller than y', () => {
            const x = { value: 2 };
            const y = { value: 5 };

            const sorted = compareAscBy('value')(x, y);
            expect(sorted).toBe(-1);
        });

        it('returns 1 if x is smaller than y', () => {
            const x = { value: 3 };
            const y = { value: 1 };

            const sorted = compareAscBy('value')(x, y);
            expect(sorted).toBe(1);
        });

        it('returns 0 if x is equal to y', () => {
            const x = { value: 2 };
            const y = { value: 2 };

            const sorted = compareAscBy('value')(x, y);
            expect(sorted).toBe(0);
        });
    });

    describe('lesser function', () => {
        it('returns lesser of two', () => {
            const x = { value: 2 };
            const y = { value: 5 };

            const lesserValue = lesser(x, y, 'value');

            expect(lesserValue).toBe(x);
        });

        it('returns lesser of two with second prop if first prop is equal', () => {
            const x = { sameValue: 0, value: 2 };
            const y = { sameValue: 0, value: 5 };

            const lesserValue = lesser(x, y, 'sameValue', 'value');

            expect(lesserValue).toBe(x);
        });
    });
})
