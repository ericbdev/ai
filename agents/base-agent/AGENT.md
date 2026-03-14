---
name: base-agent
description: Abstract framework for implementing AI agents with skill management capabilities. Use as a reference for understanding agent structure and creating custom agents.
version: 1.0.0
---

## Overview

Base Agent provides a foundational framework for building AI agents that can manage and use multiple skills to accomplish tasks. It defines the core interface and common functionality that all agents should implement.

## Core Capabilities

- **Skill Management**: Add, remove, and query available skills
- **Message Processing**: Process user messages with conversation context
- **Task Execution**: Execute tasks by leveraging available skills
- **Skill Selection**: Find appropriate skills for given tasks

## Agent Interface

All agents implementing this framework should provide:

- **id**: Unique identifier for the agent
- **name**: Human-readable agent name
- **description**: What the agent does
- **version**: Agent version (semver format)
- **skills**: Array of available skills

## Core Methods

### `processMessage(message: string, context?: AgentContext): Promise<AgentMessage>`

Process user messages and generate appropriate responses.

**Parameters:**
- `message`: User's input message
- `context` (optional): Conversation history and metadata

**Returns:**
- `AgentMessage` with role, content, and timestamp

### `executeTask(task: AgentTask): Promise<AgentTask>`

Execute a task using available skills.

**Parameters:**
- `task`: Task definition with id, description, input, and status

**Returns:**
- Updated task with results or error information

### `addSkill(skill: Skill): void`

Add a skill to the agent's capability set.

### `removeSkill(skillId: string): void`

Remove a skill by its ID.

### `getSkills(): Skill[]`

Get all available skills.

## Context Structure

```typescript
interface AgentContext {
  conversationHistory: AgentMessage[];
  metadata?: {
    [key: string]: any;
  };
}

interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}
```

## Task Structure

```typescript
interface AgentTask {
  id: string;
  description: string;
  input: any;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}
```

## Implementation Guidelines

When implementing a custom agent:

1. **Define Clear Purpose**: Give your agent a specific role and capabilities
2. **Implement Message Processing**: Decide how to respond to different types of user messages
3. **Implement Task Execution**: Define logic for selecting and using skills
4. **Handle Errors Gracefully**: Always return meaningful error messages
5. **Maintain Context**: Use conversation history to provide contextual responses
6. **Select Skills Wisely**: Match tasks to the most appropriate skills

## Example Implementation Pattern

```typescript
class MyAgent {
  // Initialize with configuration
  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.version = config.version;
    this.skills = config.skills || [];
  }

  // Process user messages
  async processMessage(message: string, context?: AgentContext) {
    // 1. Add message to history
    // 2. Analyze message intent
    // 3. Generate appropriate response
    // 4. Return formatted message
  }

  // Execute tasks using skills
  async executeTask(task: AgentTask) {
    // 1. Update task status
    // 2. Find appropriate skill
    // 3. Execute skill with task input
    // 4. Return updated task with results
  }
}
```

## Best Practices

- **Single Responsibility**: Each agent should have a clear, focused purpose
- **Skill Composition**: Build agent capabilities by combining skills
- **Error Recovery**: Handle failures gracefully and provide clear error messages
- **Context Awareness**: Use conversation history to improve responses
- **Extensibility**: Design agents to easily accept new skills
