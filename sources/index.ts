export class Token {
  value?: number;
  type: string;
}

function isOfMoreOrEqualPriority(currentOp: string, otherOp: string): boolean {
  const high = "*/";
  const currOpHigh = high.indexOf(currentOp) !== -1;
  const otherOpHigh = high.indexOf(otherOp) !== -1;
  return (
    (!currOpHigh && !otherOpHigh) ||
    (!currOpHigh && otherOpHigh) ||
    (currOpHigh && otherOpHigh)
  );
}

export class ExpressionEvaluator {
  tokenizeExpression(expression: string): Array<Token> {
    var tokens: Array<Token> = [];
    var digits = "0123456789";
    var operations = "+-*/";
    var brackets = "()";
    for (var i = 0; i < expression.length; ) {
      if (brackets.indexOf(expression[i]) !== -1) {
        tokens.push({ type: expression[i] });
        i++;
        continue;
      }
      if (operations.indexOf(expression[i]) !== -1) {
        tokens.push({ type: expression[i] });
        i++;
        continue;
      }
      if (digits.indexOf(expression[i]) !== -1) {
        var temp = "";
        for (
          ;
          digits.indexOf(expression[i]) !== -1 && i < expression.length;
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

  convertToBackPolish(tokens: Array<Token>): Array<Token> {
    var brackets = "()";
    var operations = "+-*/";
    var stack: Array<Token> = [];
    var postf: Array<Token> = [];
    var currTok;

    var j = 0;
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].type == "n") {
        postf[j++] = tokens[i];
        continue;
      }
      if (tokens[i].type == "(") {
        stack.push(tokens[i]);
        continue;
      }
      if (tokens[i].type == ")") {
        do {
          currTok = stack.pop();
          postf[j++] = currTok;
        } while (postf[j - 1].type != "(");
        j--;
        continue;
      }
      if (operations.indexOf(tokens[i].type) !== -1) {
        if (stack.length > 0) {
          do {
            currTok = stack.pop();
            postf[j++] = currTok;
          } while (
            stack.length > 0 &&
            isOfMoreOrEqualPriority(tokens[i].type, postf[j - 1].type) &&
            brackets.indexOf(postf[j - 1].type) === -1
          );
          if (
            !isOfMoreOrEqualPriority(tokens[i].type, postf[j - 1].type) ||
            brackets.indexOf(postf[j - 1].type) !== -1
          ) {
            stack.push(currTok);
            j--;
          }
        }
        stack.push(tokens[i]);
        continue;
      }
    }
    while (stack.length > 0) {
      currTok = stack.pop();
      postf[j++] = currTok;
    }
    return postf;
  }

  calculateBackPolish(postf: Array<Token>): number {
    var stack: Array<Token> = [];
    var op1, op2;

    for (var i = 0; i < postf.length; i++) {
      if (postf[i].type == "n") {
        stack.push(postf[i]);
      } else {
        op2 = stack.pop();
        op1 = stack.pop();
        if (postf[i].type == "+") {
          op1.value += op2.value;
        }
        if (postf[i].type == "-") {
          op1.value -= op2.value;
        }
        if (postf[i].type == "*") {
          op1.value *= op2.value;
        }
        if (postf[i].type == "/") {
          op1.value /= op2.value;
        }
        stack.push(op1);
      }
    }
    var resultToken = stack.pop();
    var result = resultToken.value;
    return result;
  }

  evaluate(expression: string) {
    return this.calculateBackPolish(
      this.convertToBackPolish(this.tokenizeExpression(expression))
    );
  }
}
