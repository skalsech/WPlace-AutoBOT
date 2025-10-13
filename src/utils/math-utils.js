/**
 * Safe mathematical expression evaluator
 * Parses and evaluates basic arithmetic expressions without using eval() or Function()
 */

/**
 * Safely evaluates a mathematical expression string
 * @param {string} expr - Mathematical expression (e.g., "1610+50", "2000*2-100")
 * @returns {number|null} - The calculated result or null if expression is empty
 * @throws {Error} - If expression contains invalid characters or is malformed
 */
export function safeEvalMathExpression(expr) {
  if (typeof expr !== 'string' || !expr.trim()) {
    return null;
  }

  const cleanExpr = expr.replace(/\s+/g, '');

  if (!/^[0-9+\-*/().]+$/.test(cleanExpr)) {
    throw new Error('Invalid characters in expression');
  }

  if (
    cleanExpr.includes('**') ||
    cleanExpr.includes('Math') ||
    cleanExpr.includes('eval') ||
    cleanExpr.includes('[') ||
    cleanExpr.includes(']') ||
    cleanExpr.includes('{') ||
    cleanExpr.includes('}')
  ) {
    throw new Error('Unsafe expression');
  }

  const openBrackets = (cleanExpr.match(/\(/g) || []).length;
  const closeBrackets = (cleanExpr.match(/\)/g) || []).length;
  if (openBrackets !== closeBrackets) {
    throw new Error('Unbalanced brackets in expression');
  }

  try {
    const result = evaluateExpression(cleanExpr);

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      throw new Error('Invalid result');
    }

    if (Math.abs(result) > Number.MAX_SAFE_INTEGER) {
      throw new Error('Result too large');
    }

    return Math.floor(result);
  } catch (error) {
    throw new Error('Invalid mathematical expression: ' + error.message);
  }
}

function evaluateExpression(expr) {
  while (expr.startsWith('(') && expr.endsWith(')')) {
    const inner = expr.slice(1, -1);
    if (isBalanced(inner)) {
      expr = inner;
    } else {
      break;
    }
  }

  return parseAddSubtract(expr);
}

function isBalanced(str) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') count++;
    if (str[i] === ')') count--;
    if (count < 0) return false;
  }
  return count === 0;
}

function parseAddSubtract(expr) {
  let result = 0;
  let current = '';
  let operator = '+';
  let bracketLevel = 0;

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if (char === '(') {
      bracketLevel++;
      current += char;
    } else if (char === ')') {
      bracketLevel--;
      current += char;
    } else if ((char === '+' || char === '-') && bracketLevel === 0) {
      if (current) {
        const value = parseMultiplyDivide(current);
        result = operator === '+' ? result + value : result - value;
      }
      operator = char;
      current = '';
    } else {
      current += char;
    }
  }

  if (current) {
    const value = parseMultiplyDivide(current);
    result = operator === '+' ? result + value : result - value;
  }

  return result;
}

function parseMultiplyDivide(expr) {
  let result = 1;
  let current = '';
  let operator = '*';
  let bracketLevel = 0;

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if (char === '(') {
      bracketLevel++;
      current += char;
    } else if (char === ')') {
      bracketLevel--;
      current += char;
    } else if ((char === '*' || char === '/') && bracketLevel === 0) {
      if (current) {
        const value = parseNumberOrParentheses(current);
        result = operator === '*' ? result * value : result / value;
        if (operator === '/' && value === 0) {
          throw new Error('Division by zero');
        }
      }
      operator = char;
      current = '';
    } else {
      current += char;
    }
  }

  if (current) {
    const value = parseNumberOrParentheses(current);
    result = operator === '*' ? result * value : result / value;
    if (operator === '/' && value === 0) {
      throw new Error('Division by zero');
    }
  }

  return result;
}

function parseNumberOrParentheses(expr) {
  expr = expr.trim();

  if (expr.startsWith('(') && expr.endsWith(')') && isBalanced(expr.slice(1, -1))) {
    return parseAddSubtract(expr.slice(1, -1));
  } else {
    const num = parseFloat(expr);
    if (isNaN(num)) {
      throw new Error('Invalid number: ' + expr);
    }
    return num;
  }
}
