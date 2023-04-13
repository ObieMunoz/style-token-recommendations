import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { spacingTokens } from "./spacingTokens";

function findNearestToken(value: number): string {
  let minDiff = Number.MAX_VALUE;
  let nearestToken: string | null = null;

  for (const [token, tokenValue] of Object.entries(spacingTokens)) {
    const diff = Math.abs(tokenValue - value);
    if (diff < minDiff) {
      minDiff = diff;
      nearestToken = token;
    }
  }

  return nearestToken || "";
}

async function processFile(filePath: string): Promise<Map<string, string[]>> {
  return new Promise((resolve) => {
    const lineReader = readline.createInterface({
      input: fs.createReadStream(filePath),
    });

    let lineNumber = 0;
    const fileResults = new Map<string, string[]>();

    lineReader.on("line", (line) => {
      lineNumber++;
      const pxPattern = /([\w-]+)\s*:\s*([\d\s]*(?:\d+px\b\s*)+)/g;
      let match;

      while ((match = pxPattern.exec(line)) !== null) {
        const styleName = match[1];
        const pxValueString = match[2].trim();
        const pxValues = pxValueString.match(/(\d+)px/g) || [];
        const recommendations = pxValues.map((pxValue) => {
          const value = parseInt(pxValue, 10);
          return findNearestToken(value / 16);
        });

        const result = `Line: ${lineNumber} - ${styleName}: ${pxValueString} | Recommendations: ${recommendations.join(
          ", "
        )}`;

        if (fileResults.has(filePath)) {
          fileResults.get(filePath)?.push(result);
        } else {
          fileResults.set(filePath, [result]);
        }
      }
    });

    lineReader.on("close", () => {
      resolve(fileResults);
    });
  });
}

async function traverseDir(dirPath: string, startPath: string) {
  let output = "";

  for (const entry of fs.readdirSync(dirPath)) {
    const entryPath = path.join(dirPath, entry);
    const entryStats = fs.statSync(entryPath);

    if (entryStats.isFile() && /\.(svelte|css|scss)$/.test(entry)) {
      const fileResults = await processFile(entryPath);
      fileResults.forEach((results, filePath) => {
        const relativePath = path.relative(startPath, filePath);
        const fileOutput = `\nFile: ${relativePath}\n${results.join("\n")}\n`;

        console.log(fileOutput);
        output += fileOutput;
      });
    } else if (entryStats.isDirectory()) {
      output += await traverseDir(entryPath, startPath);
    }
  }

  return output;
}

(async () => {
  const startPath = process.cwd();
  const output = await traverseDir(startPath, startPath);

  fs.writeFile("Output.txt", output, (err) => {
    if (err) {
      console.error("Error writing OUTPUT.txt:", err);
    } else {
      console.log("\nOutput saved to OUTPUT.txt");
    }
  });
})();
