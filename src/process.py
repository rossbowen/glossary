#%%
import json
from collections import OrderedDict
from jinja2 import Template
from rdflib import Graph, URIRef, Literal
from rdflib.plugin import register, Parser
register("json-ld", Parser, "rdflib_jsonld.parser", "JsonLDParser")

LABELS = {
    "@id": "URI:",
    "skos:altLabel": "Alternative labels:",
    "skos:prefLabel": "Preferred label:",
    "skos:definition": "Definition:",
    "dcterms:creator": "Created by:",
    "dcterms:contributor": "Contributor:",
    "prov:wasDerivedFrom": "Derived from:",
    "dcterms:created": "Created at:",
    "dcterms:modified": "Modified at"
}

with open("../terms.ttl") as file:
    ttl = file.read()
    g = Graph().parse(data=ttl, format="turtle")

data = json.loads(
    g.serialize(
        indent=4,
        format="json-ld",
        context={
            "skos": "http://www.w3.org/2004/02/skos/core#",
            "dcterms": "http://purl.org/dc/terms/",
            "prov": "http://www.w3.org/ns/prov#"
        }))["@graph"]

metadata = [item for item in data if item["@type"] != "skos:Concept"]

data = [item for item in data if item["@type"] == "skos:Concept"]

data.sort(key = lambda x: x["skos:prefLabel"])

with open("./template.html") as f:
    tmpl = Template(f.read(), trim_blocks=True, lstrip_blocks=True)
output = tmpl.render(
    metadata=metadata,
    jsonld=data,
    labels=LABELS
)
with open("../index.html", "w") as fh:
    fh.write(output)
