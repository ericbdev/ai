/**
 * Example: Using the Simple Agent with Skills
 */

import { SimpleAgent } from '../agents/SimpleAgent';
import { TextAnalysisSkill } from '../skills/TextAnalysisSkill';
import { CodeFormatterSkill } from '../skills/CodeFormatterSkill';

async function main() {
  console.log('=== Simple Agent Demo ===\n');

  // Create an agent
  const agent = new SimpleAgent();

  // Add skills to the agent
  const textAnalysisSkill = new TextAnalysisSkill();
  const codeFormatterSkill = new CodeFormatterSkill();

  agent.addSkill(textAnalysisSkill);
  agent.addSkill(codeFormatterSkill);

  console.log(`Agent: ${agent.name}`);
  console.log(`Description: ${agent.description}`);
  console.log(`Skills: ${agent.getSkills().length}\n`);

  // Example 1: Chat with the agent
  console.log('--- Example 1: Chat with Agent ---');
  const greeting = await agent.processMessage('Hello!');
  console.log(`User: Hello!`);
  console.log(`Agent: ${greeting.content}\n`);

  const helpRequest = await agent.processMessage('What can you do?');
  console.log(`User: What can you do?`);
  console.log(`Agent: ${helpRequest.content}\n`);

  // Example 2: Execute a task with text analysis
  console.log('\n--- Example 2: Execute Text Analysis Task ---');
  const textTask = {
    id: 'task-1',
    description: 'Analyze this text',
    input: {
      text: 'Artificial intelligence is transforming how we work and live. It is amazing!',
      includeKeywords: true,
    },
    status: 'pending' as const,
  };

  const textResult = await agent.executeTask(textTask);
  console.log('Task Status:', textResult.status);
  console.log('Result:', JSON.stringify(textResult.result, null, 2));

  // Example 3: Execute a task with code formatting
  console.log('\n--- Example 3: Execute Code Formatting Task ---');
  const codeTask = {
    id: 'task-2',
    description: 'Format this JSON code',
    input: {
      code: '{"name":"Test","value":123,"nested":{"key":"value"}}',
      language: 'json',
      indent: 2,
    },
    status: 'pending' as const,
  };

  const codeResult = await agent.executeTask(codeTask);
  console.log('Task Status:', codeResult.status);
  console.log('Formatted Code:');
  console.log(codeResult.result.formatted);

  // Example 4: Conversation history
  console.log('\n--- Example 4: Conversation History ---');
  const history = agent.getConversationHistory();
  console.log(`Total messages in history: ${history.length}`);
  history.forEach((msg, index) => {
    console.log(`${index + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
  });
}

main().catch(console.error);
