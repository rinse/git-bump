export class Logger {
    #isVerbose: boolean;

    constructor(isVerbose: boolean) {
        this.#isVerbose = isVerbose;
    }

    info(message?: string, ...optionalParams: any[]) {
        const prefix = "[INFO] - ";
        console.log(`${prefix}${message}`, ...optionalParams);
    }

    debug(message?: string, ...optionalParams: any[]) {
        const prefix = "[DEBUG] - ";
        if (this.#isVerbose) {
            console.debug(`${prefix}${message}`, ...optionalParams);
        }
    }
}
