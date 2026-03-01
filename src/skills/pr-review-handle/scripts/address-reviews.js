#!/usr/bin/env node

/**
 * address-reviews.js
 * 
 * Fetches PR review threads and passes them to Claude for autonomous analysis.
 * Claude determines which reviews are actionable and applies fixes or drafts replies.
 * 
 * Usage: node address-reviews.js [--apply] [--post-replies]
 *   --apply: Actually apply fixes to files
 *   --post-replies: Post clarification replies to GitHub
 */

import { execSync, exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";

const execAsync = promisify(exec);

/**
 * Compute Levenshtein distance between two strings
 */
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;
  if (a === b) return 0;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

/**
 * Extract code symbols from context
 */
function extractSymbols(context) {
  const code = context
    .split("\n")
    .map((line) => line.replace(/^\s*\d+:\s?/, ""))
    .join("\n");

  const identifierPattern = /[a-zA-Z_$][a-zA-Z0-9_$]*/g;
  const matches = code.match(identifierPattern) || [];

  const keywords = new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "do", "switch", "case", "break", "continue", "new", "this", "class",
    "extends", "import", "export", "default", "from", "async", "await", "try",
    "catch", "finally", "throw", "typeof", "instanceof", "void", "delete",
    "in", "of", "true", "false", "null", "undefined",
  ]);

  return [...new Set(matches)].filter(sym => !keywords.has(sym) && sym.length > 1);
}

/**
 * Extract tokens from reviewer comment
 */
function extractTokensFromComment(comment) {
  const tokens = new Set();
  const backtickPattern = /`([^`]+)`/g;
  let match;

  while ((match = backtickPattern.exec(comment)) !== null) {
    const parts = match[1].split(/[.\s=()[\]{};,]+/).filter(Boolean);
    for (const part of parts) {
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part)) {
        tokens.add(part);
      }
    }
  }

  const barePattern = /(?:^|[^A-Za-z0-9_$])([a-zA-Z_$][a-zA-Z0-9_$]*)(?=$|[^A-Za-z0-9_$])/g;
  while ((match = barePattern.exec(comment)) !== null) {
    const part = match[1];
    if (part.length > 2) tokens.add(part);
  }

  return [...tokens];
}

/**
 * Find fuzzy matches using Levenshtein distance
 */
function findFuzzyMatches(tokens, symbols, threshold = 3) {
  const matches = [];

  for (const token of tokens) {
    if (symbols.includes(token)) continue;

    let bestSymbol = null;
    let bestDistance = Infinity;

    for (const symbol of symbols) {
      const maxAllowed = Math.min(
        threshold,
        Math.floor(Math.min(token.length, symbol.length) / 2)
      );

      if (Math.abs(token.length - symbol.length) > maxAllowed) continue;

      const dist = levenshteinDistance(token.toLowerCase(), symbol.toLowerCase());

      if (dist > 0 && dist <= maxAllowed && dist < bestDistance) {
        bestDistance = dist;
        bestSymbol = symbol;
      }
    }

    if (bestSymbol) {
      matches.push({
        token,
        symbol: bestSymbol,
        distance: bestDistance,
      });
    }
  }

  return matches;
}

/**
 * Get file context around a line
 */
function getFileContext(filePath, line, contextLines = 15) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const start = Math.max(0, line - contextLines);
  const end = Math.min(lines.length, line + contextLines);
  const contextLines_ = lines.slice(start, end);

  return contextLines_
    .map((l, i) => `${start + i + 1}: ${l}`)
    .join("\n");
}

/**
 * Fetch PR reviews using gh CLI
 */
function getPRReviews(prNumber) {
  try {
    const output = execSync(
      `gh api repos/{owner}/{repo}/pulls/${prNumber}/comments --paginate`,
      { encoding: "utf8" }
    );
    return JSON.parse(output);
  } catch (err) {
    console.error(`Failed to fetch reviews: ${err.message}`);
    return [];
  }
}

/**
 * Get current PR number
 */
function getCurrentPRNumber() {
  try {
    const output = execSync("gh pr view --json number,url", {
      encoding: "utf8",
    });
    return JSON.parse(output);
  } catch (err) {
    console.error("Not in a PR context or gh CLI not available");
    return null;
  }
}

/**
 * Main entry point
 */
async function main() {
  const prInfo = getCurrentPRNumber();
  if (!prInfo) {
    console.log("❌ Not in a GitHub PR context. Make sure you're in a git repo with an active PR.\n");
    process.exit(1);
  }

  console.log(`\n📝 Analyzing PR #${prInfo.number}: ${prInfo.url}\n`);

  const reviews = getPRReviews(prInfo.number);
  if (reviews.length === 0) {
    console.log("✓ No review comments found.\n");
    return;
  }

  // Build review analysis data
  const reviewData = [];

  for (const review of reviews) {
    const context = getFileContext(review.path, review.line);
    if (!context) continue;

    const symbols = extractSymbols(context);
    const tokens = extractTokensFromComment(review.body);
    const fuzzyMatches = findFuzzyMatches(tokens, symbols);

    reviewData.push({
      id: review.id,
      author: review.user.login,
      file: review.path,
      line: review.line,
      body: review.body,
      context,
      symbols,
      fuzzyMatches,
    });
  }

  console.log(`Found ${reviewData.length} review thread(s).\n`);

  // Output analysis data for Claude
  for (let i = 0; i < reviewData.length; i++) {
    const review = reviewData[i];
    console.log(`[${ i + 1}/${reviewData.length}] Review #${review.id}`);
    console.log(`File: ${review.file}:${review.line}`);
    console.log(`Author: ${review.author}`);
    console.log(`Comment: "${review.body}"\n`);

    if (review.fuzzyMatches.length > 0) {
      console.log("Levenshtein Analysis (Potential Typos):");
      for (const match of review.fuzzyMatches) {
        console.log(`  "${match.token}" → "${match.symbol}" (distance: ${match.distance})`);
      }
      console.log();
    }

     console.log("Code Context:");
     console.log(review.context);
     console.log("\n" + "=".repeat(60) + "\n");

     // Add guidance on how to analyze this
     if (i === 0) {
       console.log("\n📋 ANALYSIS GUIDANCE FOR CLAUDE\n");
       console.log("For each review thread above, evaluate using SOLID principles:");
       console.log("");
       console.log("1. IDENTIFY THE PRINCIPLE");
       console.log("   - Does this relate to OCP (open/closed: extend without modifying)?");
       console.log("   - Or DIP (depend on abstractions, not concrete implementations)?");
       console.log("");
       console.log("2. ASSESS THE VIOLATION");
       console.log("   - Is the current code actually violating the principle?");
       console.log("   - Or just different from the reviewer's preference?");
       console.log("");
       console.log("3. EVALUATE THE TRADEOFF");
       console.log("   - What's the cost of refactoring? (complexity, testing, maintenance)");
       console.log("   - What's the benefit? (testability, flexibility, maintainability)");
       console.log("   - Is the benefit worth the cost in this context?");
       console.log("");
       console.log("4. RECOMMEND THOUGHTFULLY");
       console.log("   - Present the principle and why it matters");
       console.log("   - Show the refactoring");
       console.log("   - Acknowledge the tradeoff");
       console.log("   - Let the developer decide if it's worth it");
       console.log("");
       console.log("Remember: Perfect SOLID compliance isn't always necessary.");
       console.log("Pragmatic tradeoffs are valid when documented and understood.\n");
       console.log("=".repeat(60) + "\n");
     }
   }

  // Save analysis for Claude to process
  const analysisFile = "./.pr-reviews-analysis.json";
  fs.writeFileSync(analysisFile, JSON.stringify(reviewData, null, 2));
  console.log(`\n💾 Analysis saved to ${analysisFile}`);
  console.log("\nClaude can now analyze these reviews and provide recommendations.\n");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
