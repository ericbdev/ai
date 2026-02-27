import { BaseSkill } from './BaseSkill';
import { SkillInput, SkillOutput } from '../types/skill';

/**
 * CodeFormatterSkill - Formats and beautifies code
 * 
 * This skill can:
 * - Format JSON
 * - Format basic code structures
 * - Remove extra whitespace
 * - Validate JSON syntax
 */
export class CodeFormatterSkill extends BaseSkill {
  constructor() {
    super({
      id: 'code-formatter',
      name: 'Code Formatter',
      description: 'Formats and beautifies code, with support for JSON and other formats',
      version: '1.0.0',
      tags: ['code', 'format', 'json', 'beautify'],
      inputSchema: {
        code: {
          type: 'string',
          description: 'The code to format',
          required: true,
        },
        language: {
          type: 'string',
          description: 'The language of the code (json, javascript, etc.)',
          required: false,
          default: 'json',
        },
        indent: {
          type: 'number',
          description: 'Number of spaces for indentation',
          required: false,
          default: 2,
        },
      },
    });
  }

  protected async run(input: SkillInput): Promise<SkillOutput> {
    const code = input.code as string;
    const language = (input.language as string) || 'json';
    const indent = (input.indent as number) || 2;

    try {
      let formattedCode: string;

      switch (language.toLowerCase()) {
        case 'json':
          formattedCode = this.formatJson(code, indent);
          break;
        case 'javascript':
        case 'js':
          formattedCode = this.formatJavaScript(code, indent);
          break;
        default:
          formattedCode = this.formatGeneric(code, indent);
      }

      return {
        success: true,
        data: {
          formatted: formattedCode,
          language,
          originalLength: code.length,
          formattedLength: formattedCode.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to format code',
      };
    }
  }

  private formatJson(code: string, indent: number): string {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, indent);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatJavaScript(code: string, indent: number): string {
    // Basic JavaScript formatting (simplified)
    let formatted = code.trim();
    const indentStr = ' '.repeat(indent);
    let level = 0;
    let result = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      const prevChar = i > 0 ? formatted[i - 1] : '';

      // Track if we're in a string
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }

      if (!inString) {
        if (char === '{' || char === '[') {
          result += char + '\n';
          level++;
          result += indentStr.repeat(level);
        } else if (char === '}' || char === ']') {
          result += '\n';
          level--;
          result += indentStr.repeat(level) + char;
        } else if (char === ';') {
          result += char + '\n';
          if (i + 1 < formatted.length) {
            result += indentStr.repeat(level);
          }
        } else if (char === ',') {
          result += char + ' ';
        } else {
          result += char;
        }
      } else {
        result += char;
      }
    }

    return result.trim();
  }

  private formatGeneric(code: string, indent: number): string {
    // Generic formatting - just clean up whitespace
    return code
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }
}
