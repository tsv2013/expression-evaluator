import { ExpressionEvaluator } from "../sources";

test("ExpressionEvaluator basic", () => {
  var ee = new ExpressionEvaluator();
  expect(ee.evaluate("2*2")).toBe(4);
  expect(ee.evaluate("3+2*2")).toBe(7);
  expect(ee.evaluate("6 / 2")).toBe(3);
  expect(ee.evaluate("6 / 2 + 1 + 2*2 - 5")).toBe(3);
  expect(ee.evaluate("5 % 3 ")).toBe(2);
});

test("ExpressionEvaluator calculateRPN", () => {
  var ee = new ExpressionEvaluator();
  expect(
    ee.calculateRPN([
      { value: 6, type: "n" },
      { value: 3, type: "n" },
      { type: "/" }
    ])
  ).toBe(2);
});
