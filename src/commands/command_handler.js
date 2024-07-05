import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCommandFiles(commandsPath) {
    const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith(".js"));
    return commandFiles.map(file => path.join(commandsPath, file));
}

async function loadCommand(filePath) {
    try {
        const moduleUrl = pathToFileURL(filePath).href;
        const commandModule = await import(moduleUrl);
        const command = commandModule.default ? commandModule.default : commandModule;
        if (!("data" in command && "execute" in command)) {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            return;
        } 
        return command;
    } catch (error) {
        console.log(`[ERROR] Failed to load command at ${filePath}:`, error);
    }
}

async function loadCommands() {
    const foldersPath = path.join(__dirname);
    const commandFolders = await fs.readdir(foldersPath, { withFileTypes: true });
    const commands = new Map();

    // Iterate through all folders and files in the commands directory to load all commands.
    for (const folder of commandFolders) {
        if (!folder.isDirectory()) continue; // Skip files

        const commandsPath = path.join(foldersPath, folder.name);
        const commandFiles = await loadCommandFiles(commandsPath);

        for (const filePath of commandFiles) {
            const command = await loadCommand(filePath);
            if (command) {
                commands.set(command.data.name, command);
            }
        }
    }
    return commands;
}

let commandsCache;

export async function getCommands() {
    if (!commandsCache) {
        commandsCache = await loadCommands();
    }
    return commandsCache;
}
