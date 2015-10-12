module.exports = function (_, c, mockParser, contractParser, deserializer)  {

  function findRegexCaveatStringInList(caveatList, regex) {
    return _.find(caveatList, function (packet) {return regex.test(packet.getValueAsText()); }).getValueAsText().trim();
  }

  function findCaveatSchema(deserializedMac) {
    var CAVEAT_PREFIX = /schema = .*/;
    var CAVEAT_PREFIX_LEN = "schema = ".length;
    var schema = findRegexCaveatStringInList(deserializedMac.caveatPackets, CAVEAT_PREFIX);
    return schema.substr(CAVEAT_PREFIX_LEN).trim();
  }

  //interpreting function as {_args: "args", _return: "return"} may be a gaping security hole
  return {
    startfunc: function (args, res) { return c.object({_args: args, _return: res}); },
    func: function (expectedArgsTree, expectedReturnTree) { 

      var expectedArgs = _.flatten(expectedArgsTree).join("");
      var expectedReturn = _.flatten(expectedReturnTree).join("");

      function macValidation (macMaybe) {

        var deserializedMac = deserializer(macMaybe);
        var actualRequestMacSchema = findCaveatSchema(deserializedMac);

        var pass = true;

        try{
          var argsValid = contractParser.parse(expectedArgs);
          var returnValid = contractParser.parse(expectedReturn);
          var mockMacFn = mockParser.parse(actualRequestMacSchema);
          c.object({_args: argsValid, _return: returnValid}).check(mockMacFn);
        }catch(e){
          pass = false;
          console.log("request func e.message = %j", e.message);
          throw e;
        }
        return pass;
      }

      return c.and(c.pred(macValidation), c.string);
    },
    tuple: function (args) { return c.tuple.apply(null, args); },
    array: function (args) { return c.array.apply(null, args); },
    map: function (args) { return c.hash.apply(null, args); },
    object: function (pairs) { return c.object(_.object(pairs)); },
    int: function () { return c.integer; },
    str: function () { return c.string; },
    num: function () { return c.number; },
    bool: function () { return c.bool; },
    void: function () { return c.nothing; }
  };
};