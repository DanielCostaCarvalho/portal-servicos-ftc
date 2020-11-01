# Instalação do projeto portal-servicos-ftc

## Requisitos

- NodeJS "^10.0.0"
- npm "^6.0.0"
- AdonisJS

## Primeiramente

 - Altere o ".env.example" para ".env"

## Depois execute os comandos

 - npm install 

 - npm run build

 - mkdir tmp

 - node ace migration:run

 - node ace db:seed
 
 - node run start
 
 Caso ocorra algum erro no processo de instalação similar a:
 
  "Error while executing: undefined ls-remote -h -t {repositório}"
  
 Tente executar os comandos no GitBash
