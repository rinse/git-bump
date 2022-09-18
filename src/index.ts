#!/usr/bin/env node
import { commandLineOptions } from "./cli";
import { assumeVersion } from "./gitBump";

function main() {
    const version = assumeVersion({
        release: commandLineOptions["release"],
        prerelease: commandLineOptions["prerelease"],
        build: commandLineOptions["build"],
        initialVersion: commandLineOptions["initial-version"],
        includeNonAnnotatedTags: commandLineOptions["include-non-annotated"],
        verbose: commandLineOptions["verbose"],
    });
    console.log(version.get());
}

main();
