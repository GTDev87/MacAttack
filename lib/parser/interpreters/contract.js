module.exports = function (_, c) {
  //interpreting function as {_args: "args", _return: "return"} may be a gaping security hole
  return {
    func: function (argsValidator, returnValidator) { return c.object({_args: argsValidator, _return: returnValidator}); },
    tuple: function (args) { return c.tuple.apply(null, args); },
    array: function (arg) { return c.array.apply(null, arg); },
    map: function (arg) { return c.hash.apply(null, arg); },
    object: function (pairs) { return c.object(_.object(pairs)); },
    int: function () { return c.integer; },
    str: function () { return c.string; },
    num: function () { return c.number; },
    bool: function () { return c.bool; },
    void: function () { return c.nothing; }
  };
};