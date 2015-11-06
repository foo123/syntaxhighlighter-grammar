// 1. a partial xml grammar in simple JSON format
var xml_grammar = {
    
// prefix ID for regular expressions, represented as strings, used in the grammar
"RegExpID"                          : "RE::",

// Style model
"Style"                             : {
    
     "declaration"                  : "keyword"
    ,"doctype"                      : "variable"
    ,"meta"                         : "variable"
    ,"comment"                      : "comments"
    ,"cdata"                        : "color2"
    ,"atom"                         : "constants"
    ,"tag"                          : "keyword"
    ,"attribute"                    : "color1"
    ,"string"                       : "string"
    ,"number"                       : "constants"

},

// Lexical model
"Lex"                               : {
     
     "comment:comment"              : ["&lt;!--", "--&gt;"]
    ,"declaration:block"            : ["&lt;?xml", "?&gt;"]
    ,"doctype:block"                : ["RE::/&lt;!doctype\\b/i", "&gt;"]
    ,"meta:block"                   : ["RE::/&lt;\\?[_a-zA-Z][\\w\\._\\-]*/", "?&gt;"]
    ,"cdata:block"                  : ["&lt;![CDATA[", "]]&gt;"]
    ,"open_tag"                     : "RE::/&lt;([_a-zA-Z][_a-zA-Z0-9\\-]*)/"
    ,"close_tag"                    : "RE::/&lt;\\/([_a-zA-Z][_a-zA-Z0-9\\-]*)&gt;/"
    ,"attribute"                    : "RE::/[_a-zA-Z][_a-zA-Z0-9\\-]*/"
    ,"string:line-block"            : [["\""], ["'"]]
    ,"number"                       : ["RE::/[0-9]\\d*/", "RE::/#[0-9a-fA-F]+/"]
    ,"atom"                         : ["RE::/&amp;#x[a-fA-F\\d]+;/", "RE::/&amp;#[\\d]+;/", "RE::/&amp;[a-zA-Z][a-zA-Z0-9]*;/"]
    ,"text"                         : "RE::/[^&]+/"
    
    // actions
    ,"tag_ctx:action"               : {"context":true}
    ,"\\tag_ctx:action"             : {"context":false}
    ,"unique_id:action"             : {"unique":["xml", "$1"],"msg":"Duplicate id value \"$0\""}
    ,"unique_att:action"            : {"unique":["tag", "$0"],"msg":"Duplicate attribute \"$0\"","in-context":true}
    ,"tag_opened:action"            : {"push":"<$1>","ci":true}
    ,"tag_closed:action"            : {"pop":"<$1>","ci":true,"msg":"Tags \"$0\" and \"$1\" do not match"}
    ,"tag_autoclosed:action"        : {"pop":null}
    ,"out_of_place:error"           : "\"$2$3\" can only be at the beginning of XML document"
    
},
    
// Syntax model (optional)
"Syntax"                            : {
     
     "tag_att"                      : "'id'.attribute unique_att '=' string unique_id | attribute unique_att '=' (string | number)"
    ,"start_tag"                    : "open_tag.tag tag_ctx tag_opened tag_att* ('&gt;'.tag | '/&gt;'.tag tag_autoclosed) \\tag_ctx"
    ,"end_tag"                      : "close_tag.tag tag_closed"
    ,"xml"                          : "(^^1 declaration? doctype?) (declaration.error out_of_place | doctype.error out_of_place | comment | meta | cdata | start_tag | end_tag | atom | text)*"
    
},
    
// what to parse and in what order
"Parser"                            : [ ["xml"] ]

};
