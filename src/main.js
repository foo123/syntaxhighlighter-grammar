/**
*
*   SyntaxHighlighterGrammar
*   @version: @@VERSION@@
*
*   Transform a grammar specification in JSON format, into a syntax-highlight brush for SyntaxHighlighter
*   https://github.com/foo123/syntaxhighlighter-grammar
*   https://github.com/foo123/editor-grammar
*
**/


//
// parser factories
var SyntaxHighlighterParser = Class(Parser, {
    constructor: function SyntaxHighlighterParser( grammar, DEFAULT ) {
        var self = this;
        Parser.call(self, grammar, "", "");
        self.DEF = DEFAULT || self.$DEF;
        self.ERR = /*grammar.Style.error ||*/ self.$ERR;
    }
    
    ,tokenize: function( stream, state, row ) {
        var self = this, tokens = [], token, buf = [], id = null,
            raw_content = function( token ) { return token.value; },
            maybe_raw = function( token ) { return self.$DEF === token.type ? token.value : token; }
        ;
        //state.line = row || 0;
        if ( stream.eol() ) { state.line++; if ( state.$blank$ ) state.bline++; }
        else while ( !stream.eol() )
        {
            token = self.token( stream, state );
            if ( state.$actionerr$ )
            {
                if ( buf.length ) tokens = tokens.concat( map( buf, raw_content ) );
                tokens.push( token.value );
                buf.length = 0; id = null;
            }
            else
            {
                if ( id !== token.name )
                {
                    if ( buf.length ) tokens = tokens.concat( map( buf, maybe_raw ) );
                    buf.length = 0; id = token.name;
                }
                buf.push( token );
            }
        }
        if ( buf.length ) tokens = tokens.concat( map( buf, maybe_raw ) );
        buf.length = 0; id = null;
        return tokens;
    }
});


function esc_token( i, tokens )
{
    var t = tokens[i];
    if ( t.value ) t.value = esc_html( t.value, 1 );
    else t = esc_html( t, 1 );
    tokens[i] = t;
}

function get_mode( grammar, SyntaxHighlighter ) 
{
    var Token = SyntaxHighlighter.Match,
        Highlighter = SyntaxHighlighter.Highlighter,
        SyntaxHighlighterBrush = Class(Highlighter, {
            constructor: function SyntaxHighlighterBrush( ) {
                var self = this;
                Highlighter.call( self );
            }
        })
    ;
    SyntaxHighlighterBrush.$id = uuid("syntaxhighlighter_grammar_brush");
    SyntaxHighlighterBrush.escapeHtml = false;
    SyntaxHighlighterBrush.$parser = new SyntaxHighlighterGrammar.Parser( parse_grammar( grammar ) );
    SyntaxHighlighterBrush.dispose = function( ) {
        if ( SyntaxHighlighterBrush.$parser ) SyntaxHighlighterBrush.$parser.dispose( );
        SyntaxHighlighterBrush.$parser = null;
    };
	//SyntaxHighlighterBrush.aliases = [lang];
	//SyntaxHighlighter.brushes[lang] = SyntaxHighlighterBrush;
    return SyntaxHighlighterBrush;
}


//
//  SyntaxHighlighter Grammar main class
/**[DOC_MARKDOWN]
*
* ###SyntaxHighlighterGrammar Methods
*
* __For node:__
*
* ```javascript
* SyntaxHighlighterGrammar = require('build/syntaxhighlighter_grammar.js');
* ```
*
* __For browser:__
*
* ```html
* <script src="build/syntaxhighlighter_grammar.js"></script>
* ```
*
[/DOC_MARKDOWN]**/
var SyntaxHighlighterGrammar = exports['@@MODULE_NAME@@'] = {
    
    VERSION: "@@VERSION@@",
    
    // clone a grammar
    /**[DOC_MARKDOWN]
    * __Method__: `clone`
    *
    * ```javascript
    * cloned_grammar = SyntaxHighlighterGrammar.clone( grammar [, deep=true] );
    * ```
    *
    * Clone (deep) a `grammar`
    *
    * Utility to clone objects efficiently
    [/DOC_MARKDOWN]**/
    clone: clone,
    
    // extend a grammar using another base grammar
    /**[DOC_MARKDOWN]
    * __Method__: `extend`
    *
    * ```javascript
    * extended_grammar = SyntaxHighlighterGrammar.extend( grammar, basegrammar1 [, basegrammar2, ..] );
    * ```
    *
    * Extend a `grammar` with `basegrammar1`, `basegrammar2`, etc..
    *
    * This way arbitrary `dialects` and `variations` can be handled more easily
    [/DOC_MARKDOWN]**/
    extend: extend,
    
    // pre-process a grammar (in-place)
    /**[DOC_MARKDOWN]
    * __Method__: `pre_process`
    *
    * ```javascript
    * pre_processed_grammar = SyntaxHighlighterGrammar.pre_process( grammar );
    * ```
    *
    * This is used internally by the `SyntaxHighlighterGrammar` Class `parse` method
    * In order to pre-process a `JSON grammar` (in-place) to transform any shorthand configurations to full object configurations and provide defaults.
    * It also parses `PEG`/`BNF` (syntax) notations into full (syntax) configuration objects, so merging with other grammars can be easier if needed.
    [/DOC_MARKDOWN]**/
    pre_process: preprocess_and_parse_grammar,
    
    // parse a grammar
    /**[DOC_MARKDOWN]
    * __Method__: `parse`
    *
    * ```javascript
    * parsed_grammar = SyntaxHighlighterGrammar.parse( grammar );
    * ```
    *
    * This is used internally by the `SyntaxHighlighterGrammar` Class
    * In order to parse a `JSON grammar` to a form suitable to be used by the syntax-highlighter.
    * However user can use this method to cache a `parsedgrammar` to be used later.
    * Already parsed grammars are NOT re-parsed when passed through the parse method again
    [/DOC_MARKDOWN]**/
    parse: parse_grammar,
    
    // get an SyntaxHighlighter-compatible brush from a grammar
    /**[DOC_MARKDOWN]
    * __Method__: `getMode`
    *
    * ```javascript
    * mode = SyntaxHighlighterGrammar.getMode( grammar, SyntaxHighlighter );
    * ```
    *
    * This is the main method which transforms a `JSON grammar` into a syntax-highlighter brush for `SyntaxHighlighter`.
    [/DOC_MARKDOWN]**/
    getMode: get_mode,
    
    // make Parser class available
    /**[DOC_MARKDOWN]
    * __Parser Class__: `Parser`
    *
    * ```javascript
    * Parser = SyntaxHighlighterGrammar.Parser;
    * ```
    *
    * The Parser Class used to instantiate a highlight brush parser, is available.
    * The `getMode` method will instantiate this parser class, which can be overriden/extended if needed, as needed.
    * In general there is no need to override/extend the parser, unless you definately need to.
    [/DOC_MARKDOWN]**/
    Parser: SyntaxHighlighterParser
};
