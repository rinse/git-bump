import {getKeywordRegex} from "./keywords";

describe("getKeywordRegex", () => {
    describe("it returns a regex, which matches one of given keywords.", () => {
        test("the first case", () => {
            const regex = getKeywordRegex(["beautiful", "hello"]);
            const actual = regex.test("beautiful songs");
            expect(actual).toBe(true);
        });

        test("the second case", () => {
            const regex = getKeywordRegex(["beautiful", "hello"]);
            const actual = regex.test("hello, world");
            expect(actual).toBe(true);
        });
    });

    test("it returns a regex which matches only when a keyword is at the begenning of the line.", () => {
        const regex = getKeywordRegex(["beautiful", "hello"]);
        const actual = regex.test("The dog is beautiful.");
        expect(actual).toBe(false);
    });

    describe("it returns a regex, symbols in keywords are not treated as special characters in a regex.", () => {
        test("the first case", () => {
            const regex = getKeywordRegex(["he.lo"]);
            const actual = regex.test("hello");
            expect(actual).toBe(false);
        });

        test("the second case", () => {
            const regex = getKeywordRegex(["he.lo"]);
            const actual = regex.test("he.lo");
            expect(actual).toBe(true);
        });
    });

    test("it does not match even an empty string if an array is empty.", () => {
        const regex = getKeywordRegex([]);
        const actual = regex.test("");
        expect(actual).toBe(false);
    });
});
