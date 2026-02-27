/**
 * Example: Using the Code Formatter Skill
 */

import { CodeFormatterSkill } from '../skills/CodeFormatterSkill';

async function main() {
  const skill = new CodeFormatterSkill();

  console.log('=== Code Formatter Skill Demo ===\n');

  // Example 1: Format JSON
  const jsonCode = '{"name":"John Doe","age":30,"email":"john@example.com","address":{"street":"123 Main St","city":"New York"}}';

  console.log('Example 1: Format JSON');
  console.log('Original:', jsonCode);
  const result1 = await skill.execute({
    code: jsonCode,
    language: 'json',
    indent: 2,
  });
  console.log('\nFormatted:');
  console.log(result1.data.formatted);
  console.log('\nMetadata:', result1.metadata);

  // Example 2: Format with different indentation
  console.log('\n\nExample 2: Format JSON with 4-space indentation');
  const result2 = await skill.execute({
    code: jsonCode,
    language: 'json',
    indent: 4,
  });
  console.log(result2.data.formatted);

  // Example 3: Handle invalid JSON
  console.log('\n\nExample 3: Handle Invalid JSON');
  const invalidJson = '{name: "test", value: }';
  const result3 = await skill.execute({
    code: invalidJson,
    language: 'json',
  });
  console.log('Success:', result3.success);
  console.log('Error:', result3.error);

  // Example 4: Format JavaScript
  console.log('\n\nExample 4: Format JavaScript');
  const jsCode = 'function test(){const x=1;const y=2;return x+y;}';
  const result4 = await skill.execute({
    code: jsCode,
    language: 'javascript',
    indent: 2,
  });
  console.log(result4.data.formatted);
}

main().catch(console.error);
