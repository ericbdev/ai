import { Skill } from './skill';

/**
 * Represents a message in an agent conversation
 */
export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

/**
 * Represents the context for an agent
 */
export interface AgentContext {
  conversationHistory: AgentMessage[];
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Represents a task for an agent to execute
 */
export interface AgentTask {
  id: string;
  description: string;
  input: any;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

/**
 * Represents an agent in the AI toolkit
 * Agents are intelligent entities that can use multiple skills to accomplish tasks
 */
export interface Agent {
  /**
   * Unique identifier for the agent
   */
  id: string;

  /**
   * Human-readable name of the agent
   */
  name: string;

  /**
   * Description of what the agent does
   */
  description: string;

  /**
   * Version of the agent
   */
  version: string;

  /**
   * Skills available to this agent
   */
  skills: Skill[];

  /**
   * Process a user message and generate a response
   * @param message - The user message
   * @param context - The conversation context
   * @returns A promise that resolves to the agent's response
   */
  processMessage(message: string, context?: AgentContext): Promise<AgentMessage>;

  /**
   * Execute a task using available skills
   * @param task - The task to execute
   * @returns A promise that resolves to the task result
   */
  executeTask(task: AgentTask): Promise<AgentTask>;

  /**
   * Add a skill to the agent's available skills
   * @param skill - The skill to add
   */
  addSkill(skill: Skill): void;

  /**
   * Remove a skill from the agent's available skills
   * @param skillId - The ID of the skill to remove
   */
  removeSkill(skillId: string): void;

  /**
   * Get all available skills
   */
  getSkills(): Skill[];
}
