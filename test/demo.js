function syntaxhighlighter_grammar_demo(code, lang, grammar)
{
    document.getElementById('editor-version').innerHTML = '3.0.83';
    document.getElementById('grammar-version').innerHTML = SyntaxHighlighterGrammar.VERSION;
    var brushName = lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase(),
        mode = SyntaxHighlighterGrammar.getMode( grammar, SyntaxHighlighter );
    mode.aliases = [ lang ];
    SyntaxHighlighter.brushes[ brushName ] = mode;
    SyntaxHighlighter.highlight( {brush: lang}, code );
}