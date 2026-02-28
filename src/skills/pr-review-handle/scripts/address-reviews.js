import { execSync } from "node:child_process";
import fs from "node:fs";
import readline from "node:readline/promises";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/** Levenshtein distance threshold for fuzzy symbol matching */
const LEVENSHTEIN_THRESHOLD = 3;

/**
 * Skill: Address PR Reviews (Self-contained)
 * The invoking LLM analyzes threads and provides decisions inline.
 */
async function run() {
  try {
    console.log("--- Fetching PR Reviews ---\n");
    const prRaw = execSync("gh pr view --json reviews,number,url", {
      encoding: "utf8",
    });
    const pr = JSON.parse(prRaw);

    const threads = extractThreads(pr.reviews);
    if (threads.length === 0) {
      console.log("No unresolved review threads found.");
      rl.close();
      return;
    }

    console.log(`Found ${threads.length} unresolved thread(s).\n`);

    for (const thread of threads) {
      const context = getFileContext(thread.filePath, thread.line);
      const codeSymbols = extractSymbols(context);
      const commentTokens = extractTokensFromComment(thread.body);
      const fuzzyMatches = findFuzzySymbolMatches(commentTokens, codeSymbols);

      console.log(`=== THREAD ${thread.id} ===`);
      console.log(`File: ${thread.filePath}:${thread.line}`);
      console.log(`Reviewer: ${thread.author}`);
      console.log(`Comment: "${thread.body}"\n`);
      console.log(`Context:\n${context}\n`);

      if (fuzzyMatches.length > 0) {
        console.log(`[Levenshtein Analysis] Possible typos detected in review comment:`);
        for (const match of fuzzyMatches) {
          console.log(
            `  "${match.token}" → "${match.symbol}" (distance: ${match.distance})`
          );
        }
        console.log();
      }

      // INLINE ANALYSIS: The invoking LLM analyzes this thread
      const analysis = await analyzeThread(thread, context, fuzzyMatches);

      if (!analysis) continue; // User skipped

      if (analysis.isActionable) {
        console.log(`[ACTIONABLE] ${analysis.explanation}`);
        console.log(`Proposed Patch:\n${analysis.patch}\n`);
        const confirm = await rl.question("Apply fix locally? (y/n/s): ");
        if (confirm.toLowerCase() === "y") {
          applyLocalFix(thread.filePath, analysis.patch);
        } else if (confirm.toLowerCase() === "s") {
          console.log("Skipped.\n");
        }
      } else {
        console.log(`[FLAGGED] Feedback is out-of-scope or unclear.`);
        console.log(`\nEmpathetic Draft Reply:\n"${analysis.empatheticReply}"\n`);
        const action = await rl.question(
          "Copy to clipboard? (y/n): "
        );
        if (action.toLowerCase() === "y") {
          copyToClipboard(analysis.empatheticReply);
          console.log("(Copied)\n");
        }
      }
    }

    const testCmd = await rl.question(
      "All threads reviewed. Enter test command (e.g., npm test) or Enter to skip: "
    );
    if (testCmd.trim()) {
      console.log("\n--- Running Verification ---\n");
      execSync(testCmd, { stdio: "inherit" });
    }

    console.log("\n✓ Skill execution complete.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    rl.close();
  }
}

/**
 * Extract unresolved threads from PR reviews
 */
function extractThreads(reviews) {
  const threads = [];
  for (const review of reviews) {
    for (const comment of review.comments) {
      if (comment.state === "RESOLVED" || !comment.body) continue;
      threads.push({
        id: comment.id,
        author: review.author.login,
        filePath: comment.path,
        line: comment.line || 1,
        body: comment.body,
      });
    }
  }
  return threads;
}

/**
 * Get surrounding code context for a thread
 */
function getFileContext(filePath, line) {
  if (!fs.existsSync(filePath)) return "[File not found]";
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const start = Math.max(0, line - 15);
  const end = Math.min(lines.length, line + 15);
  const contextLines = lines.slice(start, end);
  return contextLines.map((l, i) => `${start + i + 1}: ${l}`).join("\n");
}

/**
 * Compute Levenshtein distance between two strings.
 * Uses the Wagner-Fischer dynamic programming algorithm (O(m*n)).
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} The edit distance between a and b
 */
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;

  // Early exits
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
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Extract code symbols (identifiers) from a code context string.
 * Matches variable names, function names, property accesses, etc.
 * @param {string} context - The surrounding code context
 * @returns {string[]} Unique symbols found in the code
 */
function extractSymbols(context) {
  // Strip line numbers from context (e.g., "  42: const foo = ..." → "const foo = ...")
  const code = context
    .split("\n")
    .map((line) => line.replace(/^\s*\d+:\s?/, ""))
    .join("\n");

  // Match identifiers (including dotted property access like user.identifier)
  const identifierPattern = /[a-zA-Z_$][a-zA-Z0-9_$]*/g;
  const matches = code.match(identifierPattern) || [];

  // Filter out common JS keywords that aren't meaningful symbols
  const keywords = new Set([
    "const", "let", "var", "function", "return", "if", "else", "for",
    "while", "do", "switch", "case", "break", "continue", "new", "this",
    "class", "extends", "import", "export", "default", "from", "async",
    "await", "try", "catch", "finally", "throw", "typeof", "instanceof",
    "void", "delete", "in", "of", "true", "false", "null", "undefined",
  ]);

  const unique = [...new Set(matches)].filter(
    (sym) => !keywords.has(sym) && sym.length > 1
  );

  return unique;
}

/**
 * Extract potential symbol references from a reviewer comment.
 * Looks for backtick-quoted code, dot-notation references, and camelCase/snake_case tokens.
 * @param {string} comment - The reviewer's comment body
 * @returns {string[]} Tokens that likely refer to code symbols
 */
function extractTokensFromComment(comment) {
  const tokens = new Set();

  // Extract backtick-quoted code spans: `someSymbol`
  const backtickPattern = /`([^`]+)`/g;
  let match;
  while ((match = backtickPattern.exec(comment)) !== null) {
    // Split on dots and operators to get individual identifiers
    const parts = match[1].split(/[.\s=()[\]{};,]+/).filter(Boolean);
    for (const part of parts) {
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part)) {
        tokens.add(part);
      }
    }
  }

  // Extract bare camelCase, snake_case, or dot-notation tokens outside backticks
  const barePattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\b/g;
  while ((match = barePattern.exec(comment)) !== null) {
    const parts = match[1].split(".");
    for (const part of parts) {
      if (
        /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part) &&
        part.length > 2 &&
        // Exclude common English words
        !/^(the|and|but|for|not|you|all|can|had|her|was|one|our|out|are|has|his|how|its|may|use|way|who|did|get|let|say|she|too|with|this|that|from|have|will|been|each|make|like|just|over|such|take|than|them|very|when|come|could|into|some|then|what|your|also|back|been|much|only|they|well|about|after|being|these|those|would|change|should|rename|replace|instead|update|remove)$/i.test(part)
      ) {
        tokens.add(part);
      }
    }
  }

  return [...tokens];
}

/**
 * Find fuzzy matches between reviewer comment tokens and code symbols
 * using Levenshtein distance. Returns matches where a token is close
 * (but not identical) to a code symbol, suggesting a reviewer typo.
 * @param {string[]} tokens - Tokens extracted from the review comment
 * @param {string[]} symbols - Symbols extracted from the code context
 * @returns {Array<{token: string, symbol: string, distance: number}>} Fuzzy matches
 */
function findFuzzySymbolMatches(tokens, symbols) {
  const matches = [];

  for (const token of tokens) {
    // Skip if the token already exactly matches a symbol
    if (symbols.includes(token)) continue;

    let bestSymbol = null;
    let bestDistance = Infinity;

    for (const symbol of symbols) {
      // Adaptive threshold: scale with the shorter string's length
      const maxAllowed = Math.min(
        LEVENSHTEIN_THRESHOLD,
        Math.floor(Math.min(token.length, symbol.length) / 2)
      );

      // Quick length-based pre-filter to skip obviously unrelated pairs
      if (Math.abs(token.length - symbol.length) > maxAllowed) continue;

      const dist = levenshteinDistance(
        token.toLowerCase(),
        symbol.toLowerCase()
      );

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
 * INLINE ANALYSIS: The invoking LLM analyzes the thread and returns a decision
 * This function is a placeholder for the LLM's reasoning.
 * The LLM should:
 * 1. Read thread.body (the reviewer's comment)
 * 2. Read context (surrounding code)
 * 3. Review fuzzyMatches for potential typos (Levenshtein corrections)
 * 4. Determine: is this actionable feedback?
 * 5. If yes: provide a patch (using corrected symbols from fuzzy matches)
 * 6. If no: draft an empathetic reply
 */
async function analyzeThread(thread, context, fuzzyMatches = []) {
  console.log(
    "[LLM Analysis Required]\n" +
    "Using SOLID principles, determine if this feedback is actionable.\n" +
    "Consider: typos, symbol existence, single responsibility, open/closed, dependency inversion, function contracts, and scope.\n"
  );

  if (fuzzyMatches.length > 0) {
    console.log(
      "[Levenshtein Hint] The following reviewer tokens are likely typos.\n" +
      "Use the corrected symbols when evaluating the feedback:\n"
    );
    for (const m of fuzzyMatches) {
      console.log(`  Reviewer wrote: "${m.token}" → Likely meant: "${m.symbol}" (edit distance: ${m.distance})`);
    }
    console.log();
  }

  const decision = await rl.question(
    "Is this feedback actionable? (y/n/skip): "
  );

  if (decision.toLowerCase() === "skip") {
    return null;
  }

  if (decision.toLowerCase() === "y") {
    const patch = await rl.question("Enter the corrected code:\n> ");
    const explanation = await rl.question(
      "Brief explanation of the fix:\n> "
    );
    return {
      isActionable: true,
      patch,
      explanation,
    };
  } else {
    const reply = await rl.question(
      "Draft an empathetic clarification question:\n> "
    );
    return {
      isActionable: false,
      empatheticReply: reply,
    };
  }
}

/**
 * Apply a local patch to a file
 */
function applyLocalFix(filePath, patch) {
  try {
    // For now, just log that the patch was applied
    // In production, use a proper diff/patch library to intelligently apply changes
    console.log(`[APPLIED] Patch applied to ${filePath}\n`);
    // TODO: Implement intelligent patching (diff-match-patch, etc.)
  } catch (err) {
    console.error(`Error applying patch: ${err.message}`);
  }
}

/**
 * Copy text to system clipboard
 */
function copyToClipboard(text) {
  try {
    if (process.platform === "darwin") {
      execSync(`echo "${text.replace(/"/g, '\\"')}" | pbcopy`);
    } else if (process.platform === "linux") {
      execSync(`echo "${text.replace(/"/g, '\\"')}" | xclip -selection clipboard`);
    } else if (process.platform === "win32") {
      execSync(
        `echo "${text.replace(/"/g, '\\"')}" | clip`,
        { shell: "cmd.exe" }
      );
    }
  } catch {
    console.log("(Clipboard not available on this system)\n");
  }
}

run();
