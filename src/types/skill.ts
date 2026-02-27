/**
 * Represents the input parameters for a skill
 */
export interface SkillInput {
  [key: string]: any;
}

/**
 * Represents the output result from a skill
 */
export interface SkillOutput {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime?: number;
    timestamp?: string;
    [key: string]: any;
  };
}

/**
 * Represents a skill in the AI toolkit
 * Skills are reusable capabilities that can be executed with specific inputs
 */
export interface Skill {
  /**
   * Unique identifier for the skill
   */
  id: string;

  /**
   * Human-readable name of the skill
   */
  name: string;

  /**
   * Description of what the skill does
   */
  description: string;

  /**
   * Version of the skill
   */
  version: string;

  /**
   * Tags for categorizing and searching skills
   */
  tags?: string[];

  /**
   * Schema describing the expected input parameters
   */
  inputSchema?: {
    [key: string]: {
      type: string;
      description?: string;
      required?: boolean;
      default?: any;
    };
  };

  /**
   * Execute the skill with the given input
   * @param input - The input parameters for the skill
   * @returns A promise that resolves to the skill output
   */
  execute(input: SkillInput): Promise<SkillOutput>;
}
