const fs = require('fs');
const $rdf = require('rdflib');

/*
https://stackoverflow.com/questions/36096063/rdflib-js-how-to-serialize-the-data-into-turtle-ttl-format
*/

TURTLE_FILE = "glossary.ttl"
MARKDOWN_FILE = "index.md"
DCT = $rdf.Namespace('http://purl.org/dc/terms/');
RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
RDFS = $rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
SKOS = $rdf.Namespace('http://www.w3.org/2004/02/skos/core#');

function recursivePrint(file, concept, level=2) {
    fragment = new URL(concept.value).hash
    label = kb.any($rdf.sym(concept.value), RDFS('label'))
    definition = kb.any($rdf.sym(concept.value), SKOS('definition'))
    fs.appendFileSync(
        file, 
        `#`.repeat(level) +` [${label}](${fragment})\n` +
        `\n` +
        `- ${definition}\n` +
        `\n`,
        function (err) {
    });
    children = kb.each($rdf.sym(concept.value), SKOS('narrower'))
    for (var i=0; i < children.length; i++) {
            child = children[i]
            recursivePrint(file, child, level + 1)
    }
}

// - create an empty store
var kb = new $rdf.IndexedFormula();

// - load RDF file
fs.readFile(TURTLE_FILE, function (err, data) {
    if (err) { console.log("Error reading file.") }

    // NOTE: to get rdflib.js' RDF/XML parser to work with node.js,
    // see https://github.com/linkeddata/rdflib.js/issues/47

    // - parse RDF/XML file
    $rdf.parse(data.toString(), kb, "https://rossbowen.github.io/glossary#", 'text/turtle', function(err, kb) {
        if (err) {};

        var concept_schemes = kb.each(
            undefined, 
            RDF('type'), 
            SKOS('ConceptScheme')
        )
        
        for (var i=0; i < concept_schemes.length; i++) {
            scheme = concept_schemes[i]
            fragment = new URL(scheme.value).hash
            issued = kb.any($rdf.sym(scheme.value), DCT('issued'))
            title = kb.any($rdf.sym(scheme.value), DCT('title'))
            creator = kb.any($rdf.sym(scheme.value), DCT('creator'))
            fs.appendFileSync(
                MARKDOWN_FILE, 
                `# [${title}](${fragment})\n` +
                `\n` +
                `> ${creator}, ${issued}\n` +
                `\n`,
                function (err) {
                    if (err) {}
            });

            var top_concepts = kb.each(
                $rdf.sym(scheme.value), 
                SKOS('hasTopConcept'), 
                undefined
            )

            for (var i=0; i < top_concepts.length; i++) {
                concept = top_concepts[i]
                recursivePrint(MARKDOWN_FILE, concept)
            }
        }
    });
});
