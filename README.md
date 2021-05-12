# GDAC Business Glossary

This repository contains the _GDAC Business Glossary_ work of the Government Data Architecture Community (GDAC) Business Glossary Sub-group.

- [Documentation](https://rossbowen.github.io/glossary/)

### Building the vocabulary

The vocabulary is available as a [turtle file](./terms.ttl) which is created using CSV on the Web and Swirrl's `csv2rdf` library.

To add or amend terms, make changes to the [CSV file](./terms.csv) as required and then run Swirrl's `csv2rdf` tool.

```sh
docker run --rm -v $PWD:/workspace -w /workspace -it gsscogs/csv2rdf \
csv2rdf -u terms.csv-metadata.json -m annotated -o terms.ttl
```

### Building the documentation

The documentation makes use of github pages and is built from the vocabulary directly using a [python script](./src/process.py) and a [jinja2 template](./src/template.html).

Changes to the documentation should be made to the template and then `index.html` rebuilt using the python script.

```sh
docker run --rm -v $PWD:/workspace -w /workspace -it python:latest \
/bin/bash -c "python -m pip install -r requirements.txt; python3 process.py"
```

The styling is creating using a [custom profile](./src/respec-profile) of [W3C's Respec](https://github.com/w3c/respec) library.
