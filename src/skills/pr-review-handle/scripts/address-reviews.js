import { execSync } from "node:child_process";
import fs from "node:fs";
import readline from "node:readline/promises";
import DiffMatchPatch from "diff-match-patch";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/** Levenshtein distance threshold for fuzzy symbol matching */
const LEVENSHTEIN_THRESHOLD = 3;

// Extract bare camelCase, snake_case, or dot-notation tokens outside backticks
const barePattern =
  /(?:^|[^A-Za-z0-9_$])([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)(?=$|[^A-Za-z0-9_$])/g;

/**
 * Skill: Address PR Reviews (Self-contained)
 * The invoking LLM analyzes threads and provides decisions inline.
 *
 * Uses `gh api` extensively for direct REST API access with better control.
 */
async function run() {
  try {
    console.log("--- Fetching PR Reviews via gh api ---\n");

    // First, get the current PR number using gh pr view
    const prInfoRaw = execSync("gh pr view --json number,url", {
      encoding: "utf8",
    });
    const prInfo = JSON.parse(prInfoRaw);
    const prNumber = prInfo.number;

    console.log(`Analyzing PR #${prNumber}: ${prInfo.url}\n`);

    // Fetch reviews using gh api with pagination support
    const reviews = fetchPRReviews(prNumber);

    // Fetch review comments (line-specific comments) using gh api
    const reviewComments = fetchPRReviewComments(prNumber);

    // Combine and extract threads from both sources
    const threads = extractThreadsFromAPI(reviews, reviewComments);

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
        console.log(
          `[Levenshtein Analysis] Possible typos detected in review comment:`,
        );
        for (const match of fuzzyMatches) {
          console.log(
            `  "${match.token}" → "${match.symbol}" (distance: ${match.distance})`,
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
        console.log(
          `\nEmpathetic Draft Reply:\n"${analysis.empatheticReply}"\n`,
        );
        const action = await rl.question("Copy to clipboard? (y/n): ");
        if (action.toLowerCase() === "y") {
          copyToClipboard(analysis.empatheticReply);
          console.log("(Copied)\n");
        }
      }
    }

    console.log("\n  All threads reviewed.");

    console.log("\n✓ Skill execution complete.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    rl.close();
  }
}

/**
 * Fetch PR reviews using gh api directly
 * Provides access to review-level data including state (APPROVED, CHANGES_REQUESTED, etc.)
 * @param {number} prNumber - Pull request number
 * @returns {Array} Array of review objects
 */
function fetchPRReviews(prNumber) {
  try {
    // Use gh api with pagination to fetch all reviews
    const reviewsRaw = execSync(
      `gh api repos/{owner}/{repo}/pulls/${prNumber}/reviews --paginate`,
      { encoding: "utf8" },
    );
    return JSON.parse(reviewsRaw);
  } catch (err) {
    console.error(`Error fetching reviews: ${err.message}`);
    return [];
  }
}

/**
 * Fetch PR review comments using gh api directly
 * Gets line-specific comments with more detailed information
 * @param {number} prNumber - Pull request number
 * @returns {Array} Array of review comment objects
 */
function fetchPRReviewComments(prNumber) {
  try {
    // Use gh api with pagination to fetch all review comments
    const commentsRaw = execSync(
      `gh api repos/{owner}/{repo}/pulls/${prNumber}/comments --paginate`,
      { encoding: "utf8" },
    );
    return JSON.parse(commentsRaw);
  } catch (err) {
    console.error(`Error fetching review comments: ${err.message}`);
    return [];
  }
}

/**
 * Extract unresolved threads from API responses
 * Combines review-level comments and line-specific review comments
 * @param {Array} reviews - Reviews from gh api
 * @param {Array} reviewComments - Review comments from gh api
 * @returns {Array} Array of unresolved thread objects
 */
function extractThreadsFromAPI(reviews, reviewComments) {
  const threads = [];

  // Process line-specific review comments (these are the actual code comments)
  for (const comment of reviewComments) {
    // Skip comments without body
    if (!comment.body) continue;

    // Check if this comment is part of a resolved conversation
    // Note: GitHub's API doesn't always provide a direct "resolved" field
    // We'll include all comments and let the user handle resolution

    threads.push({
      id: comment.id,
      author: comment.user.login,
      filePath: comment.path,
      line: comment.line || comment.original_line || null,
      body: comment.body,
      reviewId: comment.pull_request_review_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      inReplyTo: comment.in_reply_to_id,
      // Additional metadata from gh api
      diffHunk: comment.diff_hunk,
      position: comment.position,
      originalPosition: comment.original_position,
    });
  }

  return threads;
}

/**
 * Extract unresolved threads from PR reviews (legacy method)
 * Kept for backwards compatibility with gh pr view
 */
function extractThreads(reviews) {
  const threads = [];
  for (const review of reviews) {
    if (!review || !Array.isArray(review.comments)) continue;
    for (const comment of review.comments) {
      if (comment.state === "RESOLVED" || !comment.body) continue;
      threads.push({
        id: comment.id,
        author: review?.author?.login || "unknown",
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
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return dp[m][n];
}

function isNotCommonEnglishWord(part) {
  return !/^(the|and|but|for|not|you|all|can|had|her|was|one|our|out|are|has|his|how|its|may|use|way|who|did|get|let|say|she|too|with|this|that|from|have|will|been|each|make|like|just|over|such|take|than|them|very|when|come|could|into|some|then|what|your|also|back|been|much|only|they|well|about|after|being|these|those|would|change|should|rename|replace|instead|update|remove)$/i.test(
    part,
  );
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
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "new",
    "this",
    "class",
    "extends",
    "import",
    "export",
    "default",
    "from",
    "async",
    "await",
    "try",
    "catch",
    "finally",
    "throw",
    "typeof",
    "instanceof",
    "void",
    "delete",
    "in",
    "of",
    "true",
    "false",
    "null",
    "undefined",
  ]);

  const unique = [...new Set(matches)].filter(
    (sym) => !keywords.has(sym) && sym.length > 1,
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

  while ((match = barePattern.exec(comment)) !== null) {
    const parts = match[1].split(".");
    for (const part of parts) {
      if (
        /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part) &&
        part.length > 2 &&
        // Exclude common English words
        isNotCommonEnglishWord(part)
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
        Math.floor(Math.min(token.length, symbol.length) / 2),
      );

      // Quick length-based pre-filter to skip obviously unrelated pairs
      if (Math.abs(token.length - symbol.length) > maxAllowed) continue;

      const dist = levenshteinDistance(
        token.toLowerCase(),
        symbol.toLowerCase(),
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
      "Using Liskov Substitution Principle, determine if this feedback is actionable.\n" +
      "Consider: typos, symbol existence, function contracts, scope.\n",
  );

  if (fuzzyMatches.length > 0) {
    console.log(
      "[Levenshtein Hint] The following reviewer tokens are likely typos.\n" +
        "Use the corrected symbols when evaluating the feedback:\n",
    );
    for (const m of fuzzyMatches) {
      console.log(
        `  Reviewer wrote: "${m.token}" → Likely meant: "${m.symbol}" (edit distance: ${m.distance})`,
      );
    }
    console.log();
  }

  const decision = await rl.question(
    "Is this feedback actionable? (y/n/skip): ",
  );

  if (decision.toLowerCase() === "skip") {
    return null;
  }

  if (decision.toLowerCase() === "y") {
    const patch = await rl.question("Enter the corrected code:\n> ");
    const explanation = await rl.question("Brief explanation of the fix:\n> ");
    return {
      isActionable: true,
      patch,
      explanation,
    };
  } else {
    const reply = await rl.question(
      "Draft an empathetic clarification question:\n> ",
    );
    return {
      isActionable: false,
      empatheticReply: reply,
    };
  }
}

/**
 * Apply a local patch to a file using diff-match-patch
 * @param {string} filePath - Path to the file to patch
 * @param {string} newContent - The new/corrected content to apply
 */
function applyLocalFix(filePath, newContent) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`[ERROR] File not found: ${filePath}\n`);
      return;
    }

    // Read the current file content
    const originalContent = fs.readFileSync(filePath, "utf8");

    // Initialize diff-match-patch
    const dmp = new DiffMatchPatch();

    // Create a diff between the original content and the new content
    const diffs = dmp.diff_main(originalContent, newContent);

    // Clean up the diffs for semantic clarity
    dmp.diff_cleanupSemantic(diffs);

    // Create patches from the diffs
    const patches = dmp.patch_make(originalContent, diffs);

    // Apply the patches
    const [patchedContent, results] = dmp.patch_apply(patches, originalContent);

    // Check if all patches were applied successfully
    const allSuccessful = results.every((result) => result === true);

    if (allSuccessful) {
      // Write the patched content back to the file
      fs.writeFileSync(filePath, patchedContent, "utf8");
      console.log(`[APPLIED] Patch successfully applied to ${filePath}\n`);
    } else {
      // Some patches failed - report which ones
      const failedCount = results.filter((r) => !r).length;
      console.warn(
        `[PARTIAL] ${results.length - failedCount}/${results.length} patches applied to ${filePath}`,
      );
      console.warn(
        `Some patches could not be applied cleanly. Manual review recommended.\n`,
      );

      // Still write the partially patched content
      fs.writeFileSync(filePath, patchedContent, "utf8");
    }
  } catch (err) {
    console.error(`[ERROR] Failed to apply patch: ${err.message}\n`);
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
      execSync(
        `echo "${text.replace(/"/g, '\\"')}" | xclip -selection clipboard`,
      );
    } else if (process.platform === "win32") {
      execSync(`echo "${text.replace(/"/g, '\\"')}" | clip`, {
        shell: "cmd.exe",
      });
    }
  } catch {
    console.log("(Clipboard not available on this system)\n");
  }
}

run();
