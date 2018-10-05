import { ExpressionEvaluator, TokenizerStates } from "../sources";

test("scan token", () => {
  var ee = new ExpressionEvaluator();
  var tc = ee.scanToken("2*2", 0);
  expect(tc.tokenString).toBe("2");
  expect(tc.workingState).toBe(TokenizerStates.ParsingNumber);
  expect(tc.pos).toBe(1);
  tc = ee.scanToken("2*2", 1);
  expect(tc.tokenString).toBe("*");
  expect(tc.workingState).toBe(TokenizerStates.ParsingFunction);
  expect(tc.pos).toBe(2);
  tc = ee.scanToken("2*2", 2);
  expect(tc.tokenString).toBe("2");
  expect(tc.workingState).toBe(TokenizerStates.ParsingNumber);
  expect(tc.pos).toBe(3);

  tc = ee.scanToken("2 * 2", 0);
  expect(tc.tokenString).toBe("2");
  expect(tc.workingState).toBe(TokenizerStates.ParsingNumber);
  expect(tc.pos).toBe(1);
  tc = ee.scanToken("2 * 2", 1);
  expect(tc.tokenString).toBe("*");
  expect(tc.workingState).toBe(TokenizerStates.ParsingFunction);
  expect(tc.pos).toBe(3);
  tc = ee.scanToken("2 * 2", 3);
  expect(tc.tokenString).toBe("2");
  expect(tc.workingState).toBe(TokenizerStates.ParsingNumber);
  expect(tc.pos).toBe(5);

  tc = ee.scanToken("", 0);
  expect(tc.tokenString).toBe("");
  expect(tc.workingState).toBe(TokenizerStates.Error);
  expect(tc.pos).toBe(0);
  tc = ee.scanToken(" ", 0);
  expect(tc.tokenString).toBe("");
  expect(tc.workingState).toBe(TokenizerStates.Error);
  expect(tc.pos).toBe(1);
  tc = ee.scanToken("   ", 0);
  expect(tc.tokenString).toBe("");
  expect(tc.workingState).toBe(TokenizerStates.Error);
  expect(tc.pos).toBe(3);
});

test("tokenize", () => {
  var ee = new ExpressionEvaluator();
  var tokens = ee.tokenize("2*2");
  expect(tokens.length).toBe(3);
  expect(tokens[0].type).toBe("n");
  expect(tokens[1].type).toBe("*");
  expect(tokens[2].type).toBe("n");

  tokens = ee.tokenize("2 * 2");
  expect(tokens.length).toBe(3);
  expect(tokens[0].type).toBe("n");
  expect(tokens[1].type).toBe("*");
  expect(tokens[2].type).toBe("n");
});

test("tokenize ') '", () => {
  var ee = new ExpressionEvaluator();
  var tokens = ee.tokenize("5 % (3-1) ");
  expect(tokens.length).toBe(7);
  expect(tokens[0].type).toBe("n");
  expect(tokens[1].type).toBe("%");
  expect(tokens[2].type).toBe("(");
  expect(tokens[3].type).toBe("n");
  expect(tokens[4].type).toBe("-");
  expect(tokens[5].type).toBe("n");
  expect(tokens[6].type).toBe(")");
});

test("calculateRPN", () => {
  var ee = new ExpressionEvaluator();
  expect(
    ee.calculateRPN([
      { value: 6, type: "n" },
      { value: 3, type: "n" },
      { type: "/" }
    ])
  ).toBe(2);
});

test("basic", () => {
  var ee = new ExpressionEvaluator();
  expect(ee.evaluate("2*2")).toBe(4);
  expect(ee.evaluate("3+2*2")).toBe(7);
  expect(ee.evaluate("6 / 2")).toBe(3);
  expect(ee.evaluate("6 / 2 + 1 + 2*2 - 5")).toBe(3);
  expect(ee.evaluate("5 % 3 ")).toBe(2);
  expect(ee.evaluate("5 % (3-1) ")).toBe(1);
});

test("basic logic", () => {
  var ee = new ExpressionEvaluator();
  expect(ee.evaluate("true")).toBe(true);
  expect(ee.evaluate("true and true")).toBe(true);
  expect(ee.evaluate("false or false")).toBe(false);
  expect(ee.evaluate("!true")).toBe(false);
  expect(ee.evaluate("!false")).toBe(true);
});

test("custom functions", () => {
  var ee = new ExpressionEvaluator();
  ExpressionEvaluator.operations["myFunc"] = {
    priority: 100,
    function: (a, b) => (a + b) / 2
  };
  ExpressionEvaluator.operations["mySq"] = {
    priority: 100,
    function: a => a * a
  };
  ExpressionEvaluator.operations["mySecond"] = {
    priority: 100,
    function: (a, b, c) => b
  };
  expect(ee.evaluate("myFunc(2,4)")).toBe(3);
  expect(ee.evaluate("mySq(2)")).toBe(4);
  expect(ee.evaluate("myFunc(2,4) + mySq(2)")).toBe(7);
  expect(ee.evaluate("mySecond(5, myFunc(2,4), mySq(2))")).toBe(3);
});

test("tokenize custom functions", () => {
  var ee = new ExpressionEvaluator();
  var tokens = ee.tokenize("mySecond(5, myFunc(2,4), mySq(2))");
  expect(tokens.length).toBe(13);
  expect(tokens[0].type).toBe("mySecond");
  expect(tokens[1].type).toBe("(");
  expect(tokens[2].type).toBe("n");
  expect(tokens[3].type).toBe("myFunc");
  expect(tokens[4].type).toBe("(");
  expect(tokens[5].type).toBe("n");
  expect(tokens[6].type).toBe("n");
  expect(tokens[7].type).toBe(")");
  expect(tokens[8].type).toBe("mySq");
  expect(tokens[9].type).toBe("(");
  expect(tokens[10].type).toBe("n");
  expect(tokens[11].type).toBe(")");
  expect(tokens[12].type).toBe(")");
});

test("RPN custom functions", () => {
  var ee = new ExpressionEvaluator();
  var tokens = ee.convertToRPN(
    ee.tokenize("mySecond(5, myFunc(2,4), mySq(2))")
  );
  expect(tokens.length).toBe(7);
  expect(tokens[0].type).toBe("n");
  expect(tokens[1].type).toBe("n");
  expect(tokens[2].type).toBe("n");
  expect(tokens[3].type).toBe("myFunc");
  expect(tokens[4].type).toBe("n");
  expect(tokens[5].type).toBe("mySq");
  expect(tokens[6].type).toBe("mySecond");
});

test("basic float", () => {
  var ee = new ExpressionEvaluator();
  expect(ee.evaluate("2.1*2")).toBe(4.2);
});

test("basic empty", () => {
  var ee = new ExpressionEvaluator();
  expect(ee.evaluate("")).toBe(undefined);
  expect(ee.evaluate(" ")).toBe(undefined);
  expect(ee.evaluate("   ")).toBe(undefined);
  expect(ee.evaluate("0")).toBe(0);
});

test("tokenize function with number in name", () => {
  var ee = new ExpressionEvaluator();
  ExpressionEvaluator.operations["myFun1WithNumbers2"] = {
    priority: 100,
    function: (a, b) => (a + b) / 2
  };
  var tokens = ee.tokenize("myFun1WithNumbers2(2,4)");
  expect(tokens.length).toBe(5);
  expect(tokens[0].type).toBe("myFun1WithNumbers2");
  expect(tokens[1].type).toBe("(");
  expect(tokens[2].type).toBe("n");
  expect(tokens[3].type).toBe("n");
  expect(tokens[4].type).toBe(")");
});

test("custom function with number in name", () => {
  var ee = new ExpressionEvaluator();
  ExpressionEvaluator.operations["myFun1WithNumber"] = {
    priority: 100,
    function: (a, b) => (a + b) / 2
  };
  expect(ee.evaluate("myFun1WithNumber(2,4)")).toBe(3);
});

test("tokenize context simple property", () => {
  var ee = new ExpressionEvaluator();
  var tokens = ee.tokenize("{propertyName} + 1");
  expect(tokens.length).toBe(5);
  expect(tokens[0].type).toBe("$$getContextValue");
  expect(tokens[1].type).toBe("n");
  expect(tokens[2].type).toBe("n");
  expect(tokens[3].type).toBe("+");
  expect(tokens[4].type).toBe("n");
});

test("context simple property", () => {
  var ee = new ExpressionEvaluator();
  expect(ee.evaluate("{propertyName} + 1", { propertyName: 1 })).toBe(2);
});
