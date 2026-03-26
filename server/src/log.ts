import { appendFile } from 'fs/promises';
const logFile = "./log"

export function log(str: string) {
    appendFile(logFile, str + "\n");
}
