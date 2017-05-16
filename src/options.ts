function parseArgs() {
    let url = document.URL;
    if (url.indexOf("?") === -1) {
        return {};
    }

    let argsString = url.split("?")[1];
    let argsArray = argsString.split("&");
    let args: any = {};
    for (let arg of argsArray) {
        let argSplitted = arg.split("=");
        let argName = argSplitted[0];
        let argValue: any = true;
        if (argSplitted.length > 1) {
            argSplitted.shift();
            argValue = argSplitted.join("=");
        }
        args[argName] = argValue;
    }
    return args;
}

let parsedArgs = parseArgs();
function getLang() {
    let lang = parsedArgs.lang;
    if ("en" === lang) {
        return lang;
    }
    return "fr";
}
export const DEBUGGING = parsedArgs.debug !== undefined && parsedArgs.debug !== "false";
export const LANG = getLang();
