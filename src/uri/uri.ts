export default class URI {
    public static inNS(ns: string, id: string): string {
        // this probably misses a lot of special cases
        // but it'll do for now
        const lastChar = ns[ns.length - 1];
        if (lastChar === "/") {
            return `${ns}${id}`;
        } else {
            return `${ns}#${id}`;
        }
    }
}
