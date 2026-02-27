import { BaseAgent } from './BaseAgent';
import { AgentContext, AgentMessage, AgentTask } from '../types/agent';

/**
 * SimpleAgent - A basic agent that can use skills to accomplish tasks
 * 
 * This agent:
 * - Maintains conversation history
 * - Can execute tasks using available skills
 * - Provides simple responses based on skill execution
 */
export class SimpleAgent extends BaseAgent {
  private conversationHistory: AgentMessage[] = [];

  constructor() {
    super({
      id: 'simple-agent',
      name: 'Simple Agent',
      description: 'A basic agent that can use skills to process requests and execute tasks',
      version: '1.0.0',
    });
  }

  /**
   * Process a user message
   */
  public async processMessage(message: string, context?: AgentContext): Promise<AgentMessage> {
    // Add user message to history
    const userMessage: AgentMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    if (context?.conversationHistory) {
      this.conversationHistory = [...context.conversationHistory];
    }
    this.conversationHistory.push(userMessage);

    // Generate a simple response
    const response = this.generateResponse(message);

    const assistantMessage: AgentMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    this.conversationHistory.push(assistantMessage);

    return assistantMessage;
  }

  /**
   * Execute a task using available skills
   */
  public async executeTask(task: AgentTask): Promise<AgentTask> {
    const updatedTask = { ...task };
    updatedTask.status = 'in-progress';

    try {
      // Try to find a skill that matches the task description
      const skill = this.findBestSkill(task.description);

      if (!skill) {
        updatedTask.status = 'failed';
        updatedTask.error = 'No suitable skill found for this task';
        return updatedTask;
      }

      // Execute the skill
      const result = await skill.execute(task.input);

      if (result.success) {
        updatedTask.status = 'completed';
        updatedTask.result = result.data;
      } else {
        updatedTask.status = 'failed';
        updatedTask.error = result.error;
      }
    } catch (error) {
      updatedTask.status = 'failed';
      updatedTask.error = error instanceof Error ? error.message : String(error);
    }

    return updatedTask;
  }

  /**
   * Generate a simple response based on user message
   */
  private generateResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm ${this.name}. I have ${this.skills.length} skills available. How can I help you?`;
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      const skillsList = this.skills.map(s => `- ${s.name}: ${s.description}`).join('\n');
      return `I can help you with the following:\n\n${skillsList || 'No skills available yet.'}`;
    }

    if (lowerMessage.includes('skills')) {
      return `I have ${this.skills.length} skill(s): ${this.skills.map(s => s.name).join(', ')}`;
    }

    return "I understand. Please specify a task you'd like me to execute, or ask for 'help' to see what I can do.";
  }

  /**
   * Find the best skill for a task description
   */
  private findBestSkill(description: string): any {
    const lowerDescription = description.toLowerCase();

    // Simple keyword matching
    for (const skill of this.skills) {
      const skillKeywords = [
        skill.id,
        skill.name.toLowerCase(),
        ...(skill.tags || []).map(t => t.toLowerCase()),
      ];

      if (skillKeywords.some(keyword => lowerDescription.includes(keyword))) {
        return skill;
      }
    }

    return this.skills[0]; // Return first skill as fallback
  }

  /**
   * Get conversation history
   */
  public getConversationHistory(): AgentMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  public clearHistory(): void {
    this.conversationHistory = [];
  }
}
