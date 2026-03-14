---
name: simple-agent
description: A basic conversational agent that can process messages, execute tasks, and leverage multiple skills. Use when you need a general-purpose agent that responds to queries and performs skill-based task execution.
version: 1.0.0
---

## Overview

Simple Agent is a straightforward implementation of an AI agent that demonstrates core agent functionality. It can maintain conversation context, respond to basic queries, and execute tasks by selecting appropriate skills.

## Capabilities

- **Conversational Interface**: Responds to greetings, help requests, and general queries
- **Task Execution**: Executes tasks by intelligently selecting from available skills
- **Conversation History**: Maintains context across multiple interactions
- **Skill Discovery**: Helps users understand what skills are available
- **Dynamic Skill Selection**: Matches tasks to skills based on keywords and descriptions

## Core Behaviors

### Message Processing

The agent responds to several types of user messages:

- **Greetings** (`hello`, `hi`): Responds with a friendly greeting and capability summary
- **Help Requests** (`help`, `what can you do`): Lists all available skills with descriptions
- **Skill Queries** (`skills`): Shows count and names of available skills
- **General Messages**: Prompts user to specify a task or request help

### Task Execution

When executing a task, the agent:

1. Updates task status to `in-progress`
2. Finds the most appropriate skill using keyword matching
3. Executes the skill with the provided input
4. Updates task status based on execution results (`completed` or `failed`)
5. Returns the updated task with results or error information

### Skill Selection Logic

The agent uses simple keyword matching to find skills:

- Matches against skill ID
- Matches against skill name (case-insensitive)
- Matches against skill tags
- Falls back to first available skill if no match found

## Usage Examples

### Basic Conversation

```typescript
// Greeting
User: "Hello!"
Agent: "Hello! I'm Simple Agent. I have 2 skills available. How can I help you?"

// Help request
User: "What can you do?"
Agent: "I can help you with the following:
- Text Analysis: Analyze text and provide statistics
- Code Formatter: Format code with proper indentation"

// Skill query
User: "What skills do you have?"
Agent: "I have 2 skill(s): Text Analysis, Code Formatter"
```

### Task Execution

```typescript
// Define a task
const task = {
  id: 'task-1',
  description: 'Analyze this text for readability',
  input: {
    text: 'Your text content here',
    includeKeywords: true
  },
  status: 'pending'
};

// Execute task
const result = await agent.executeTask(task);

// Result will contain:
// - status: 'completed' or 'failed'
// - result: skill execution output (if successful)
// - error: error message (if failed)
```

## Configuration

The agent is initialized with:

- **id**: `simple-agent`
- **name**: `Simple Agent`
- **description**: A basic agent that can use skills to process requests and execute tasks
- **version**: `1.0.0`
- **skills**: Empty array (skills are added dynamically)

## Adding Skills

```typescript
import { SimpleAgent } from './simple-agent';
import { TextAnalysisSkill } from '../skills/text-analysis-skill';
import { CodeFormatterSkill } from '../skills/code-formatter-skill';

const agent = new SimpleAgent();

// Add skills
agent.addSkill(new TextAnalysisSkill());
agent.addSkill(new CodeFormatterSkill());

// Now the agent can use these skills
```

## Conversation Management

The agent maintains conversation history:

- Each message includes role (`user` or `assistant`), content, and timestamp
- History can be accessed via `getConversationHistory()`
- History can be cleared via `clearHistory()`
- Context can be passed between interactions

## Error Handling

When task execution fails:

- Task status is set to `failed`
- Error message is stored in task.error
- Common errors include:
  - "No suitable skill found for this task"
  - Skill execution errors
  - Validation errors from skills

## Extending Simple Agent

To create a custom agent based on Simple Agent:

1. **Customize Response Logic**: Modify `generateResponse()` to handle domain-specific queries
2. **Improve Skill Selection**: Enhance `findBestSkill()` with better matching algorithms
3. **Add Context Processing**: Use conversation history for more contextual responses
4. **Add State Management**: Track additional state beyond conversation history
5. **Implement Planning**: Break complex tasks into subtasks

## Limitations

- Basic keyword-based skill selection (no semantic understanding)
- Simple pattern matching for message responses
- No task planning or multi-step execution
- No learning or adaptation over time
- Linear skill selection (no parallel execution)

## Best Practices

- **Add Relevant Skills Only**: Only add skills the agent needs
- **Clear Task Descriptions**: Provide descriptive task descriptions for better skill matching
- **Handle Context**: Pass conversation context when making sequential requests
- **Check Task Status**: Always verify task.status before using task.result
- **Manage History**: Clear history when starting new conversation threads
