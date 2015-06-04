{
  var thisParser = this;
  var c = thisParser.c;
}

start
  = func

anything
  = nonvoid / void

nonvoid
  = func / variable

func
  = _ "(" _ "(" _ args:functionargs _ ")" _ "->" _ res:anything _ ")" _ { 
    var objArgs = args.map(function (arg) { return {x: arg}; });
    return c.fun.apply(null, objArgs).returns(res); 
  }

functionargs
  = arguments / void

tuple
  = "[" _ args:arguments _ "]" { 
    return c.tuple.apply(null, args); 
  }

array
  = "[" _ args:arguments "..." _ "]" { 
    return c.array.apply(null, args); 
  }

map
  = "{" _ args:arguments "..." _ "}" { 
    return c.hash.apply(null, args); 
  }

object
  = "{" _ pairs:pairs _ "}" { 
    return c.object(pairs.reduce(function(agg, pair) {
      agg[pair[0]] = pair[1];
      return agg; 
    }, {}));
  }

pairs
  = head:pair _ "," _ tail:pairs {return [head].concat(tail);} / head:pair {return [head]}

pair
  = key:key _ ":" _ nonvoid:nonvoid { return [key, nonvoid];}

arguments 
  = head:anything _ "," _ tail:arguments {return [head].concat(tail);} / head:anything {return [head]}

variable
  = primitive / datastruct

datastruct
  = tuple / array / map / object

primitive
  = int / str / num / bool
  
int
  = "int" {return c.integer;}

str
  = "str"  {return c.string;}

num
  = "num"  {return c.number;}

bool
  = "bool"  {return c.bool;}

void
  = "void" {return c.nothing;}

key
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape         = "\\"
quotation_mark = '"'
unescaped      = [\x20-\x21\x23-\x5B\x5D-\u10FFFF]


//optional whitespace
_  = [ \t\r\n]*

/* ----- Core ABNF Rules ----- */

/* See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4627). */
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i