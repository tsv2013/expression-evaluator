export class Token {
  value?: number;
  type: string;
}

export class ExpressionEvaluator {
  static operations = {
    "+": {
      priority: 0,
      function: (a, b) => a! + b!
    },
    "-": {
      priority: 0,
      function: (a, b) => a! - b!
    },
    "*": {
      priority: 1,
      function: (a, b) => a! * b!
    },
    "/": {
      priority: 1,
      function: (a, b) => a! / b!
    },
    "%": {
      priority: 1,
      function: (a, b) => a! % b!
    }
  };
  private static digits = "0123456789";
  private static brackets = "()";

  private isOfMoreOrEqualPriority(currentOp: string, otherOp: string): boolean {
    return (
      ExpressionEvaluator.operations[currentOp].priority <=
      ExpressionEvaluator.operations[otherOp].priority
    );
  }

  tokenize(expression: string): Array<Token> {
    var tokens: Array<Token> = [];
    for (var i = 0; i < expression.length; ) {
      if (ExpressionEvaluator.brackets.indexOf(expression[i]) !== -1) {
        tokens.push({ type: expression[i] });
        i++;
        continue;
      }
      if (
        Object.keys(ExpressionEvaluator.operations).indexOf(expression[i]) !==
        -1
      ) {
        tokens.push({ type: expression[i] });
        i++;
        continue;
      }
      if (ExpressionEvaluator.digits.indexOf(expression[i]) !== -1) {
        var temp = "";
        for (
          ;
          ExpressionEvaluator.digits.indexOf(expression[i]) !== -1 &&
          i < expression.length;
          i++
        ) {
          temp += expression[i];
        }
        tokens.push({ value: parseInt(temp), type: "n" });
        continue;
      }
      i++;
    }
    return tokens;
  }

  convertToRPN(tokens: Array<Token>): Array<Token> {
    var stack: Array<Token> = [];
    var rpn: Array<Token> = [];
    var currToken;

    var j = 0;
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].type == "n") {
        rpn[j++] = tokens[i];
        continue;
      }
      if (tokens[i].type == "(") {
        stack.push(tokens[i]);
        continue;
      }
      if (tokens[i].type == ")") {
        do {
          currToken = stack.pop();
          rpn[j++] = currToken;
        } while (rpn[j - 1].type != "(");
        j--;
        continue;
      }
      if (
        Object.keys(ExpressionEvaluator.operations).indexOf(tokens[i].type) !==
        -1
      ) {
        if (stack.length > 0) {
          do {
            currToken = stack.pop();
            rpn[j++] = currToken;
          } while (
            stack.length > 0 &&
            this.isOfMoreOrEqualPriority(tokens[i].type, rpn[j - 1].type) &&
            ExpressionEvaluator.brackets.indexOf(rpn[j - 1].type) === -1
          );
          if (
            !this.isOfMoreOrEqualPriority(tokens[i].type, rpn[j - 1].type) ||
            ExpressionEvaluator.brackets.indexOf(rpn[j - 1].type) !== -1
          ) {
            stack.push(currToken);
            j--;
          }
        }
        stack.push(tokens[i]);
        continue;
      }
    }
    while (stack.length > 0) {
      currToken = stack.pop();
      rpn[j++] = currToken;
    }
    return rpn;
  }

  calculateRPN(rpn: Array<Token>): number {
    var operands: Array<Token> = [];

    for (var i = 0; i < rpn.length; i++) {
      if (rpn[i].type === "n") {
        operands.push(rpn[i]);
      } else {
        var func = ExpressionEvaluator.operations[rpn[i].type].function;
        var args = operands
          .splice(operands.length - func.length)
          .map(op => op.value);
        operands.push({
          type: "n",
          value: func(...args)
        });
      }
    }
    var resultToken = operands.shift();
    return resultToken.value;
  }

  evaluate(expression: string) {
    return this.calculateRPN(this.convertToRPN(this.tokenize(expression)));
  }
}
