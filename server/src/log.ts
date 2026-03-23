import { appendFile } from 'fs/promises';
const logFile = "./log"

export async function log(str: string) {
    appendFile(logFile, str + "\n");
}
