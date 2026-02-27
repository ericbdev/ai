# Agents

Agents are documentation-based instructions that define how AI assistants should behave and use multiple skills to accomplish complex tasks. Each agent is defined using markdown files with YAML frontmatter that describe their capabilities, behaviors, and usage patterns.

## Available Agents

### 1. Base Agent

Framework documentation for implementing AI agents with skill management capabilities.

See [BaseAgent/AGENT.md](./BaseAgent/AGENT.md) for the complete specification.

**Purpose:** Provides a reference framework for understanding agent structure and creating custom agents.

**Key Concepts:**
- Skill management (add, remove, query skills)
- Message processing with conversation context
- Task execution using available skills
- Skill selection and matching

### 2. Simple Agent

A basic conversational agent that demonstrates core agent functionality.

See [SimpleAgent/AGENT.md](./SimpleAgent/AGENT.md) for the complete specification.

**Purpose:** General-purpose agent that responds to queries and performs skill-based task execution.

**Capabilities:**
- Process user messages with contextual responses
- Maintain conversation history
- Execute tasks by selecting appropriate skills
- Provide help and capability discovery
- Handle greetings, help requests, and general queries

## Agent Structure

Agent definitions follow the standard markdown format with YAML frontmatter:

```markdown
---
name: agent-name
description: What the agent does and when to use it
version: 1.0.0
---

## Overview
Agent description and purpose

## Capabilities
What the agent can do

## Usage Examples
How to use the agent

## Configuration
Agent settings and requirements
```

## Core Agent Concepts

### Message Processing

Agents process user messages and generate appropriate responses based on:
- Message content and intent
- Conversation history
- Available skills and capabilities
- Agent-specific behavior patterns

### Task Execution

Agents execute tasks by:
1. Analyzing the task description
2. Selecting the most appropriate skill
3. Executing the skill with provided inputs
4. Returning results or error information

### Conversation Context

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

### Task Structure

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

## Creating Custom Agents

To create a custom agent:

1. **Create an agent directory** in `src/agents/YourAgent/`
2. **Create an AGENT.md file** with frontmatter and instructions
3. **Define clear purpose and capabilities** in the overview
4. **Document behaviors and usage patterns** with examples
5. **Specify skill requirements** if any

### Example Agent Template

```markdown
---
name: my-custom-agent
description: Brief description of what the agent does and when to use it
version: 1.0.0
---

## Overview
Detailed description of the agent's purpose and functionality

## Capabilities
- Capability 1
- Capability 2
- Capability 3

## Core Behaviors
Explain how the agent behaves in different scenarios

## Usage Examples
Provide practical examples of using the agent

## Configuration
Any settings or requirements
```

## Best Practices

1. **Clear Descriptions**: Write clear, trigger-friendly descriptions in frontmatter
2. **Document Behaviors**: Explicitly describe how agents should respond to different inputs
3. **Provide Examples**: Include practical usage examples
4. **Define Scope**: Clearly state what the agent can and cannot do
5. **Specify Skills**: Document which skills the agent should use
6. **Version Properly**: Use semantic versioning for agent definitions

## Agent vs Skills

- **Agents** define high-level behavior patterns and orchestration logic
- **Skills** define specific capabilities and actionable tasks
- Agents use multiple skills to accomplish complex goals
- Skills are reusable across different agents
