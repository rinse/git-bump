import {
    EMPTY_CONFIG,
    GitBumpConfig,
    mergeGitBumpConfigs,
    makeValidGitBumpConfig
} from "./GitBumpConfig";

describe("GitBumpConfig", () => {
    test("verifyGitBumpConfig reads an empty object.", () => {
        const actual = makeValidGitBumpConfig({});
        expect(actual).toStrictEqual(EMPTY_CONFIG);
    });

    test("verifyGitBumpConfig reads an object with an empty keywords", () => {
        const actual = makeValidGitBumpConfig({
            keywords: {},
        });
        expect(actual).toStrictEqual(EMPTY_CONFIG);
    });

    test("verifyGitBumpConfig ignores extra properties", () => {
        const actual = makeValidGitBumpConfig({extraProps: "Hello"});
        expect(actual).toStrictEqual(EMPTY_CONFIG);
    });

    test("verifyGitBumpConfig throws if keywords is not an object", () => {
        expect(() => {
            makeValidGitBumpConfig({
                keywords: "Hello",
            });
        }).toThrowError()
    });

    test("verifyGitBumpConfig throws if keywords.* are not an array", () => {
        expect(() => {
            makeValidGitBumpConfig({
                keywords: {
                    major: "Hello",
                },
            });
        }).toThrowError()
    });

    test("verifyGitBumpConfig throws if elements of keywords.* are not string", () => {
        expect(() => {
            makeValidGitBumpConfig({
                keywords: {
                    major: [{}],
                },
            });
        }).toThrowError()
    });

    test("verifyGitBumpConfig fills missing properties", () => {
        const actual = makeValidGitBumpConfig({
            keywords: {
                major: ["Hello"],
            },
        });
        const expected = {
            keywords: {
                major: ["Hello"],
                minor: [],
                patch: [],
            },
        };
        expect(actual).toStrictEqual(expected);
    });

    test("mergeGitBumpConfigs merges git-bump configs", () => {
        const config1 = {
            keywords: {
                major: ["Hello"],
                minor: [],
                patch: [],
            }
        };
        const config2 = {
            keywords: {
                major: ["Bonjour"],
                minor: ["Konnichiwa"],
                patch: [],
            }
        };
        const actual = mergeGitBumpConfigs(config1, config2);
        const expected = {
            keywords: {
                major: ["Hello", "Bonjour"],
                minor: ["Konnichiwa"],
                patch: [],
            }
        };
        expect(actual).toStrictEqual(expected);
    });

    test("mergeGitBumpConfigs prioritize the second argument than the first argument", () => {
        const globalConfig = {
            keywords: {
                major: ["Hello"],
                minor: [],
                patch: [],
            }
        };
        const localConfig = {
            keywords: {
                major: [],
                minor: ["Hello"],
                patch: [],
            }
        };
        const actual = mergeGitBumpConfigs(globalConfig, localConfig);
        const expected = {
            keywords: {
                major: [],
                minor: ["Hello"],
                patch: [],
            }
        };
        expect(actual).toStrictEqual(expected);
    });

    test("mergeGitBumpConfigs prioritize major keywords than minor keywords", () => {
        const globalConfig = {
            keywords: {
                major: ["Hello"],
                minor: ["Hello"],
                patch: [],
            }
        };
        const localConfig = {
            keywords: {
                major: [],
                minor: [],
                patch: [],
            }
        };
        const actual = mergeGitBumpConfigs(globalConfig, localConfig);
        const expected = {
            keywords: {
                major: ["Hello"],
                minor: [],
                patch: [],
            }
        };
        expect(actual).toStrictEqual(expected);
    });

    test("mergeGitBumpConfigs prioritize major keywords than minor keywords", () => {
        const globalConfig = {
            keywords: {
                major: ["Hello"],
                minor: ["Hello"],
                patch: [],
            }
        };
        const localConfig = {
            keywords: {
                major: [],
                minor: [],
                patch: [],
            }
        };
        const actual = mergeGitBumpConfigs(globalConfig, localConfig);
        const expected = {
            keywords: {
                major: ["Hello"],
                minor: [],
                patch: [],
            }
        };
        expect(actual).toStrictEqual(expected);
    });
})
