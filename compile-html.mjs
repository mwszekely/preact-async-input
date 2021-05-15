
import path from 'path';
import { promises as fs } from 'fs';
import url from 'url';

import chokidar from 'chokidar';

import { Command } from 'commander';

/**
 * All this does for now is copy the HTML to the dist directory
 * Could be rigged to do something more sophisticated but this is good enough.
 * Add more input files with the thingamajig below. 
 */

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

const program = new Command();
program.option('-w, --watch', 'Watch files for changes');
program.parse(process.argv);

const watch = (program.watch);
const inputFiles = program.args;


if (inputFiles.length == 0) {
    console.error("No input HTML files were provided (usage: compile-html [-w, --watch] ...inputfiles");
}


const allFiles = inputFiles.map(file => path.join(dirname, file));


if (watch) {
    const watching = chokidar.watch(allFiles);

    watching.on('all', (eventName, absolutePath, stats) => {
        handleFileWithOutput(absolutePath);
    });
}
else {
    allFiles.forEach(file => handlhandleFileWithOutputeFile(file));
}





async function handleFileWithOutput(absolutePath) {

    // Used for output only
    const outputPath = absolutePath.replace("src", "dist");

    try {
        await handleFile(absolutePath);
        console.log(`Saved HTML:\t${path.relative(dirname, absolutePath)}\t->\t${path.relative(dirname, outputPath)}`);
    }
    catch (e) {
        console.error(`Failed to save ${path.relative(dirname, absolutePath)}\t->\t${path.relative(dirname, outputPath)}: ${e}`);
    }
}

async function handleFile(absolutePath) {
    const inputPath = path.relative(dirname, absolutePath);
    const outputPath = inputPath.replace("src", "dist");
    await fs.copyFile(inputPath, outputPath);
}



