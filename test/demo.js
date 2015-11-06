function syntaxhighlighter_grammar_demo(code, lang, grammar)
{
    document.getElementById('editor-version').innerHTML = '3.0.9';
    document.getElementById('grammar-version').innerHTML = SyntaxHighlighterGrammar.VERSION;
    var mode = SyntaxHighlighterGrammar.getMode( grammar );
    SyntaxHighlighter.brushes[lang] = mode;
    SyntaxHighlighter.highlight( {brush: lang}, code );
}