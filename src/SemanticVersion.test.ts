import {SemanticVersion, setBuildMetadata} from "./SemanticVersion";

test("The constructor of SemanticVersion accepts a valid semantic version", () => {
    const version = new SemanticVersion("1.0.0-alpha.0+build.0");
    expect(version.get()).toBe("1.0.0-alpha.0+build.0");
});

test("The constructor of SemanticVersion throws if a given semantic version has white spaces.", () => {
    expect(() => {
        new SemanticVersion("  1.0.0 ");
    }).toThrowErrorMatchingSnapshot("invalid");
});

test("setBuildMetadata replaces a build metadata", () => {
    const a = new SemanticVersion("1.0.0-alpha.0+hello");
    const actual = setBuildMetadata(a, "bonjour").get();
    expect(actual).toBe("1.0.0-alpha.0+bonjour")
});

test("setBuildMetadata adds a build metadata", () => {
    const a = new SemanticVersion("1.0.0-alpha.0");
    const actual = setBuildMetadata(a, "bonjour").get();
    expect(actual).toBe("1.0.0-alpha.0+bonjour")
});
