import {assumeVersionPure} from "./gitBump";
import {SemanticVersion} from "./SemanticVersion";

const keywords = {
    "fix": "patch",
    "feat": "minor",
    "feat!": "major",
} as const;

const options = {
    release: false,
    prerelease: undefined,
    build: false,
    initialVersion: "0.1.0",
    includeNonAnnotatedTags: false,
    verbose: false,
};

const dependencies = {
    readExactVersion: () => null,
    readPreviousVersion: () => new SemanticVersion("1.0.0"),
    readGitLog: () => ["fix", "fix", "fix"],
    readKeywordReleaseTypeMap: () => keywords,
    readBuildMetadata: () => "build",
};

describe("assumeVersionPure returns the exact version when the exact version found", () => {
    test("The current version is a release version", () => {
        const actual = assumeVersionPure(options, {
            ...dependencies,
            readExactVersion: () => new SemanticVersion("2.0.0"),
        });
        expect(actual.get()).toBe("2.0.0");
    });
    test("The current version is a prerelease version", () => {
        const actual = assumeVersionPure(options, {
            ...dependencies,
            readExactVersion: () => new SemanticVersion("2.0.0-alpha"),
        });
        expect(actual.get()).toBe("2.0.0-alpha");
    });
})

describe("assumeVersionPure assumes a version when the current version is prerelease and the release option is enabled", () => {
    test("The current version is a release version", () => {
        const actual = assumeVersionPure({...options, release: true}, {
            ...dependencies,
            readExactVersion: () => new SemanticVersion("2.0.0"),
        });
        expect(actual.get()).toBe("2.0.0");
    });
    test("The current version is a prerelease version", () => {
        const actual = assumeVersionPure({...options, release: true}, {
            ...dependencies,
            readExactVersion: () => new SemanticVersion("2.0.0-alpha"),
        });
        expect(actual.get()).toBe("2.0.0");
    });
    test("The previous version is a prerelease version", () => {
        const actual = assumeVersionPure({...options, release: true}, {
            ...dependencies,
            readExactVersion: () => null,
            readPreviousVersion: () => new SemanticVersion("1.0.0-alpha")
        });
        expect(actual.get()).toBe("1.0.0");
    });
})

describe("assumeVersionPure assumes a release version if the previous version is a release version.", () => {
    test("it increases a patch version when only bug fixes found on the given Git log.", () => {
        const actual = assumeVersionPure({...options}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0"),
            readGitLog: () => ["fix", "fix", "fix"]
        });
        expect(actual.get()).toBe("1.0.1");
    });
    test("it increases a minor version when additional features found on the given Git log.", () => {
        const actual = assumeVersionPure({...options}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0"),
            readGitLog: () => ["fix", "fix", "feat"]
        });
        expect(actual.get()).toBe("1.1.0");
    });
    test("it increases a major version when breaking changes found on the given Git log.", () => {
        const actual = assumeVersionPure({...options}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("2.0.0");
    });
    test("When the previous version is unstable, it increases a minor version even when breaking changes found on the given Git log.", () => {
        const actual = assumeVersionPure({...options}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("0.1.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("0.2.0");
    });
    test("it increases a patch version when only bug fixes found on the given Git log.2", () => {
        const actual = assumeVersionPure({...options}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("0.1.0"),
            readGitLog: () => ["fix", "fix", "fix"]
        });
        expect(actual.get()).toBe("0.1.1");
    });
})

describe("assumeVersionPure increases a prerelease number unless the release option is enabled", () => {
    test("It adds a prerelease number if not found.", () => {
        const actual = assumeVersionPure({...options}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0-alpha"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("1.0.0-alpha.0");
    });
    test("It increases a prerelease number if one found.", () => {
        const actual = assumeVersionPure({...options}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0-alpha.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("1.0.0-alpha.1");
    });
    test("The last number is recognized as a prerelease number.", () => {
        const actual = assumeVersionPure({...options}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0-alpha.0.beta.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("1.0.0-alpha.0.beta.1");
    });
    test("It increases a prerelease number even if there is no prerelease identifier.", () => {
        const actual = assumeVersionPure({...options}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0-0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("1.0.0-1");
    });
});

describe("assumeVersionPure suggests a prerelease version if the prerelease option is supplied.", () => {
    test("The previous version is a release version.", () => {
        const actual = assumeVersionPure({...options, prerelease: "alpha"}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("2.0.0-alpha.0");
    });
    test("The previous version is a prerelease version.", () => {
        const actual = assumeVersionPure({...options, prerelease: "alpha"}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0-alpha.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("1.0.0-alpha.1");
    });
    test("The previous version is a prerelease version but a different prerelease identifier given.", () => {
        const actual = assumeVersionPure({...options, prerelease: "beta"}, {
            ...dependencies,
            readPreviousVersion: () => new SemanticVersion("1.0.0-alpha.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("1.0.0-beta.0");
    });
});

test("The suggested version will be unspecified but defined if forceRelease is true and prereleaseId is supplied", () => {
    const actual = assumeVersionPure({...options, prerelease: "alpha", release: true}, {
        ...dependencies,
        readPreviousVersion: () => new SemanticVersion("1.0.0"),
        readGitLog: () => ["fix", "feat", "feat!"],
    });
    expect(actual.get()).toBeDefined();
});

describe("If build metadata is given, the suggested version will have a build metadata.", () => {
    test("The exact version may not have one.", () => {
        const actual = assumeVersionPure({...options, build: true}, {
            ...dependencies,
            readExactVersion: () => new SemanticVersion("2.0.0"),
            readPreviousVersion: () => new SemanticVersion("1.0.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("2.0.0");
    });
    test("An assumed version has build metadata1", () => {
        const actual = assumeVersionPure({...options, build: true, release: true}, {
            ...dependencies,
            readExactVersion: () => new SemanticVersion("2.0.0-alpha.0"),
            readPreviousVersion: () => new SemanticVersion("1.0.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("2.0.0+build");
    });
    test("An assumed version has build metadata2", () => {
        const actual = assumeVersionPure({...options, build: true}, {
            ...dependencies,
            readExactVersion: () => null,
            readPreviousVersion: () => new SemanticVersion("1.0.0-alpha.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("1.0.0-alpha.1+build");
    });
    test("An assumed version has build metadata3", () => {
        const actual = assumeVersionPure({...options, build: true}, {
            ...dependencies,
            readExactVersion: () => null,
            readPreviousVersion: () => new SemanticVersion("1.0.0"),
            readGitLog: () => ["fix", "feat", "feat!"],
        });
        expect(actual.get()).toBe("2.0.0+build");
    });
});
