export class Logger {
    #isVerbose: boolean;

    constructor(isVerbose: boolean) {
        this.#isVerbose = isVerbose;
    }

    info(message?: any, ...optionalParams: any[]) {
        console.log(message, ...optionalParams);
    }

    debug(message?: any, ...optionalParams: any[]) {
        if (this.#isVerbose) {
            console.debug(message, ...optionalParams);
        }
    }
}
