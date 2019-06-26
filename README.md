# Installation du viewer OHIF et outils de développement 

L'installation du **viewer OHIF** en version 2 est beaucoup plus simple et rapide que celle de la version 1.

## Installation
#### Prérequis 
* Node.js et NPM
* Yarn


Après avoir fork & clone le  repository [OHIF/Viewers](https://github.com/OHIF/Viewers), naviguer dans le dossier root du projet (Viewers). 
On lance alors les commandes suivantes : 

```shell
#Rétablir les dépendances
yarn install

#Lancer le serveur local de visualisation
yarn start
```
Après quelques secondes (maximum 1 minute), le viewer est disponible à l'adresse http://localhost:5000/

## Ajout de fonctionnalités
Ce qu'il est nécessaire d'avoir compris avant de continuer, c'est que tout ce qui se trouve en dehors du fichier `/src` de Viewer a un processus de build séparé. Si on veut avoir un impact sur le contenu de ces fichiers librairies/extensions ( [ohif-core](https://github.com/OHIF/ohif-core), [reactviewerbase](https://github.com/OHIF/react-viewerbase), [react-cornenrstone-viewport](https://github.com/cornerstonejs/react-cornerstone-viewport), etc..), il faut nécessairement utiliser yalc.

### Installer Yalc

```shell
#Dans le repertoire Viewer par exemple
yarn global add yalc
```
### Utilisation
Admettons que je souhaite modifier un fichier de ohif-core. Après avoir navigué dans le dossier correspondant (que j'ai au préalable fork & clone dans Viewer), je rentre les commandes suivantes :
```shell
yarn install 
yalc publish
```
Je retourne ensuite dans le dossier Viewer et j’exécute : 
```shell
yarn install 
yalc add ohif-core 
yarn run dev
```
Dès a présent, yarn start lancera l'application avec maversion locale de ohif-core.
Cependant, à chaque modification de ohif-core, il faut exécuter (dans le dossier extension/librairie) :

```shell
yarn build 
yalc push
```
puis dans Viewer, exécuter de nouveau :
```shell 
yarn run dev
```

## Sécurisation par authentification 

La [doc OHIF](https://docs.ohif.org/deployment/recipes/user-account-control.html) est complète à ce sujet.
