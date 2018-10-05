# expression-evaluator
JavaScript (TypeScript) math expression evaluator library

[![Build Status](https://travis-ci.org/tsv2013/expression-evaluator.svg?branch=master)](https://travis-ci.org/tsv2013/expression-evaluator)



## How to compile this repo
 - git clone https://github.com/tsv2013/expression-evaluator.git
 - cd expression-evaluator
 - npm i
 - npm test
 - npm run build


## Sample usage

### Basic functions
```JS
  var ee = new ExpressionEvaluator();
  var res1 = ee.evaluate("6 / 2 + 1 + 2*2 - 5");
  var res2 = ee.evaluate("false or false");
```

### Custom functions
```JS
  ExpressionEvaluator.operations["myFunc"] = {
    priority: 100,
    function: (a, b) => (a+b)/2
  }
  ExpressionEvaluator.operations["mySq"] = {
    priority: 100,
    function: a => a*a
  }
  ExpressionEvaluator.operations["mySecond"] = {
    priority: 100,
    function: (a, b, c) => b
  }
  var ee = new ExpressionEvaluator();
  var result = ee.evaluate("mySecond(5, myFunc(2,4), mySq(2))");
```

### Evaluation context
```JS
  var ee = new ExpressionEvaluator();
  var evaluationContext = { propertyName: 1 };
  var result = ee.evaluate("{propertyName} + 1", evaluationContext);
```
