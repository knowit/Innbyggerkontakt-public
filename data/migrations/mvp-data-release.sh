pushd ..

# Slette alle data fra bootstrap organisasjon, hvis det er en gammel versjon her, subcollections tømmes først
python3 firestore.py  -obootstrap -cbulletin -D --all
python3 firestore.py  -obootstrap -cusers -D --all
python3 firestore.py  -corganization -dbootstrap -D

# Slette data fra demo organisasjon, hvis det er en gammel versjon her, subcollections tømmes først
python3 firestore.py  -olillevik -cbulletin -D --all
python3 firestore.py  -olillevik -cusers -D --all
python3 firestore.py  -corganization -dbootstrap -D


# Opprette bootstrap organisasjon
python3 firestore.py  -corganization -f org-bootstrap/bootstrap_organisasjon.json -d bootstrap

# Legge til brukere i bootstrap organisasjon
#python3 firestore.py  -obootstrap -cusers -f org-bootstrap/xx.json -d xx

# Legge til bulletiner i bootstrap organisasjon
#python3 firestore.py  -obootstrap -cbulletin -f org-bootstrap/xx.json


# Opprette demo organisasjon
python3 firestore.py  -corganization -f org-demo/lillevik_organisasjon.json -d lillevik

# Legge til bruker i demo organisasjon
#python3 ../firestore.py  -olillevik -cusers -f org-demo/xx.json -d xx

# Legge til bulletiner i bootstrap organisasjon
#python3 ../firestore.py  -olillevik -cbulletin -f org-bootstrap/xx.json

