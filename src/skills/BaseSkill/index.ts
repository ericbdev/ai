import { Skill, SkillInput, SkillOutput } from '../../types/skill';

/**
 * Abstract base class for implementing skills
 * Provides common functionality and enforces the Skill interface
 */
export abstract class BaseSkill implements Skill {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: string;
  public readonly tags?: string[];
  public readonly inputSchema?: {
    [key: string]: {
      type: string;
      description?: string;
      required?: boolean;
      default?: any;
    };
  };

  constructor(config: {
    id: string;
    name: string;
    description: string;
    version: string;
    tags?: string[];
    inputSchema?: {
      [key: string]: {
        type: string;
        description?: string;
        required?: boolean;
        default?: any;
      };
    };
  }) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.version = config.version;
    this.tags = config.tags;
    this.inputSchema = config.inputSchema;
  }

  /**
   * Validate input against the schema
   */
  protected validateInput(input: SkillInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.inputSchema) {
      return { valid: true, errors };
    }

    // Check required fields
    for (const [key, schema] of Object.entries(this.inputSchema)) {
      if (schema.required && !(key in input)) {
        errors.push(`Missing required field: ${key}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Execute the skill with input validation
   */
  public async execute(input: SkillInput): Promise<SkillOutput> {
    const startTime = Date.now();

    try {
      // Validate input
      const validation = this.validateInput(input);
      if (!validation.valid) {
        return {
          success: false,
          error: `Input validation failed: ${validation.errors.join(', ')}`,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Execute the skill-specific logic
      const result = await this.run(input);

      return {
        ...result,
        metadata: {
          ...result.metadata,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Override this method to implement the skill's specific logic
   */
  protected abstract run(input: SkillInput): Promise<SkillOutput>;
}
