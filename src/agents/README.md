# Agents

Agents are intelligent entities that can use multiple skills to accomplish complex tasks. They can maintain conversation context, execute tasks, and leverage available skills dynamically.

## Available Agents

### 1. Simple Agent

A basic agent that demonstrates core agent functionality.

**ID:** `simple-agent`

**Capabilities:**
- Process user messages
- Maintain conversation history
- Execute tasks using available skills
- Dynamically select appropriate skills for tasks
- Respond to basic queries (hello, help, etc.)

**Usage:**

```typescript
import { SimpleAgent, TextAnalysisSkill } from '@ericbdev/ai';

// Create an agent
const agent = new SimpleAgent();

// Add skills
const textSkill = new TextAnalysisSkill();
agent.addSkill(textSkill);

// Chat with the agent
const response = await agent.processMessage('Hello!');
console.log(response.content);

// Execute a task
const task = {
  id: 'task-1',
  description: 'Analyze this text',
  input: { text: 'Your text here' },
  status: 'pending' as const,
};

const result = await agent.executeTask(task);
console.log(result);
```

## Agent Interface

All agents implement the `Agent` interface:

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  version: string;
  skills: Skill[];
  
  processMessage(message: string, context?: AgentContext): Promise<AgentMessage>;
  executeTask(task: AgentTask): Promise<AgentTask>;
  addSkill(skill: Skill): void;
  removeSkill(skillId: string): void;
  getSkills(): Skill[];
}
```

## Creating Custom Agents

To create a custom agent, extend the `BaseAgent` class:

```typescript
import { BaseAgent, AgentContext, AgentMessage, AgentTask } from '@ericbdev/ai';

export class MyAgent extends BaseAgent {
  constructor() {
    super({
      id: 'my-agent',
      name: 'My Custom Agent',
      description: 'What this agent does',
      version: '1.0.0',
      skills: [], // Optional initial skills
    });
  }

  public async processMessage(
    message: string,
    context?: AgentContext
  ): Promise<AgentMessage> {
    // Your message processing logic
    return {
      role: 'assistant',
      content: 'Your response',
      timestamp: new Date().toISOString(),
    };
  }

  public async executeTask(task: AgentTask): Promise<AgentTask> {
    // Your task execution logic
    const updatedTask = { ...task };
    updatedTask.status = 'in-progress';
    
    // Process the task...
    
    updatedTask.status = 'completed';
    updatedTask.result = { /* your result */ };
    
    return updatedTask;
  }
}
```

## Agent Context

Agents can maintain conversation context:

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

## Agent Tasks

Agents execute tasks using their available skills:

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

## Best Practices

1. **Add Relevant Skills**: Only add skills that the agent needs for its specific purpose
2. **Handle Errors**: Always handle errors gracefully in task execution
3. **Maintain Context**: Use conversation history to provide contextual responses
4. **Clear Communication**: Provide clear feedback about task status and results
5. **Skill Selection**: Implement smart skill selection logic based on task requirements

## Examples

See [agent-example.ts](../examples/agent-example.ts) for a complete working example of using agents with skills.
