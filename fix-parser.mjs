import fs from 'fs';

const filePath = 'app/api/ai-model/route.jsx';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Replace lines 77-86 (0-indexed: 76-85)
const newLines = [
  "      return line",
  "        .replace(/^\\d+[\\.\\\\)]\\s*/, '')         // Remove \"1. \" or \"1) \"",
  "        .replace(/^[-\\*\u2022]+\\s*/, '')            // Remove all leading bullets/asterisks",
  "        .replace(/^\\*+\\s*/, '')                // Remove remaining asterisks",
  "        .replace(/^Question\\s*\\d*\\s*(\\([^)]*\\))?\\s*:?\\s*\\*{0,2}\\s*/i, '')  // Remove \"Question 1 (Category):**\"",
  "        .replace(/^\\(?(Technical|Behavioral|Problem Solving|Experience|Leadership|Professionalism|Growth|Teamwork|Frontend|Backend|Full.?Stack|CSS|Styling)[^:)]*[\\/\\)]:?\\s*\\*?\\s*/i, '')",
  "        .replace(/^Draft\\s*\\d*\\s*:?\\s*\\*?\\s*/i, '') // Remove \"Draft 1:*\" etc.",
  "        .replace(/^[\"']|[\"']$/g, '')           // Remove surrounding quotes",
  "        .replace(/\\s*->.*$/, '')               // Remove trailing commentary",
  "        .trim();"
];

// Lines 77-86 are index 76-85
lines.splice(76, 10, ...newLines.map(l => l + '\r'));

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Done! Parser cleanup chain updated.');
console.log('New lines 77-86:');
newLines.forEach((l, i) => console.log(`  ${77+i}: ${l}`));
