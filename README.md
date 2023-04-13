# style-token-recommendations

A TypeScript/Node.js utility that scans a project's directory for Svelte, CSS, and SCSS files, and analyzes their styles containing pixel values. It aims to identify and suggest appropriate spacing tokens (in rem units) as replacements for hardcoded pixel values to improve consistency and maintainability across the project. The program traverses all nested folders starting from the current working directory and generates a report for each file containing the line number, style name, original pixel value, and the recommended spacing token. This utility is designed to help developers adhere to a predefined set of spacing values and make the process of updating and managing styles more efficient.
