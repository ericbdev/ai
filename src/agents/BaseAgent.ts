import { Agent, AgentContext, AgentMessage, AgentTask } from '../types/agent';
import { Skill } from '../types/skill';

/**
 * Abstract base class for implementing agents
 * Provides common functionality and enforces the Agent interface
 */
export abstract class BaseAgent implements Agent {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: string;
  public skills: Skill[];

  constructor(config: {
    id: string;
    name: string;
    description: string;
    version: string;
    skills?: Skill[];
  }) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.version = config.version;
    this.skills = config.skills || [];
  }

  /**
   * Add a skill to the agent
   */
  public addSkill(skill: Skill): void {
    const exists = this.skills.some(s => s.id === skill.id);
    if (!exists) {
      this.skills.push(skill);
    }
  }

  /**
   * Remove a skill from the agent
   */
  public removeSkill(skillId: string): void {
    this.skills = this.skills.filter(s => s.id !== skillId);
  }

  /**
   * Get all available skills
   */
  public getSkills(): Skill[] {
    return [...this.skills];
  }

  /**
   * Find a skill by ID
   */
  protected findSkill(skillId: string): Skill | undefined {
    return this.skills.find(s => s.id === skillId);
  }

  /**
   * Process a user message and generate a response
   * Override this method to implement agent-specific message processing
   */
  public abstract processMessage(message: string, context?: AgentContext): Promise<AgentMessage>;

  /**
   * Execute a task using available skills
   * Override this method to implement agent-specific task execution logic
   */
  public abstract executeTask(task: AgentTask): Promise<AgentTask>;
}
