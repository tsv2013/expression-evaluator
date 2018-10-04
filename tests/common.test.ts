import { ExpressionEvaluator } from "../sources";

test("basic", () => {
  var ee = new ExpressionEvaluator();
  expect(ee.evaluate("2*2")).toBe(4);
});
