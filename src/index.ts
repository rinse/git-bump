#!/usr/bin/env node
import { commandLineOptions } from "./cli";
import { assumeVersion } from "./gitBump";

// Assume a current version from Git tag and Git log.
//   1. When HEAD has a tag, that is the exact version, just displays it.
//   2. When HEAD does not have a tag, assume a current version from the previous version.
//     - If the prerelease option is enabled, an output version will have a prerelease. (e.g. -beta.0)
//     - If the build option is enabled, an output version will have the git hash of HEAD as a build. (e.g. +aabbcc)

function main() {
    const version = assumeVersion({
        includeNonAnnotatedTags: commandLineOptions["include-non-annotated"],
        verbose: commandLineOptions["verbose"],
        build: commandLineOptions["build"],
        prerelease: commandLineOptions["prerelease"],
    });
    console.log(version);
}

main();
