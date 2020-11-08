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

- npm run start

Caso ocorra algum erro no processo de instalação similar a:

"Error while executing: undefined ls-remote -h -t {repositório}"

Tente executar os comandos no GitBash

# Status das rotas:

## Autenticação

Para se autenticar na API

- [x] POST ​/autenticacao
- [x] POST ​/cadastro

## Administrador master

- [x] POST ​/master​/unidades

- [x] GET ​/master​/unidades

- [x] GET ​/master​/unidades​/{idunidade}

- [x] PUT ​/master​/unidades​/{idunidade}

- [x] DELETE ​/master​/unidades​/{idunidade}

- [x] GET ​/master​/unidades​/{idunidade}​/categorias

- [x] POST ​/master​/categorias

- [x] GET ​/master​/categorias​/{idcategoria}

- [x] PUT ​/master​/categorias​/{idcategoria}

- [x] DELETE ​/master​/categorias​/{idcategoria}

- [x] GET ​/master​/unidades​/{idunidade}​/postagens

- [x] POST ​/master​/postagens

- [x] GET ​/master​/postagens​/{idpostagem}

- [x] PUT ​/master​/postagens​/{idpostagem}

- [x] DELETE ​/master​/postagens​/{idpostagem}

- [x] GET ​/master​/usuarios

- [x] POST ​/master​/usuarios

- [x] GET ​/master​/usuarios​/{idusuario}

- [x] PUT ​/master​/usuarios​/{idusuario}

- [x] DELETE ​/master​/usuarios​/{idusuario}

- [x] GET ​/master​/usuarios​/{tipousuario}

## Cliente/Paciente

- [ ] GET ​/cliente​/unidades
- [ ] GET ​/cliente​/unidades​/{idunidade}​/postagens
- [ ] GET ​/cliente​/unidades​/{idunidade}​/categorias
- [ ] GET ​/cliente​/categorias​/{idcategoria}​/servicos
- [x] POST ​/cliente​/servicos​/{idservico}​/agendas
- [ ] POST ​/cliente​/servicos​/agendamento​/{idagenda}

- [ ] GET ​/cliente​/agendamentos

- [ ] POST ​/cliente​/agendamentos​/{idagendamento}​/cancelar

## Coordenador

- [x] GET ​/coordenador​/categorias

- [x] GET ​/coordenador​/categorias​/{idcategoria}​/servicos

- [x] GET ​/coordenador​/professores

- [x] POST ​/coordenador​/servicos​

- [x] GET ​/coordenador​/servicos​/{idservico}

- [x] PUT ​/coordenador​/servicos​/{idservico}

- [x] DELETE ​/coordenador​/servicos​/{idservico}

- [x] POST ​/coordenador​/servicos​/{idservico}​/professores​/{idprofessor}

- [x] DELETE ​/coordenador​/servicos​/{idservico}​/professores​/{idprofessor}

- [x] POST ​/coordenador​/servicos​/{idservico}​/agendamentos

- [ ] GET ​/coordenador​/postagens

- [ ] POST ​/coordenador​/postagens

- [ ] PUT ​/coordenador​/postagens​/{idpostagem}

- [ ] DELETE ​/coordenador​/postagens​/{idpostagem}

- [ ] POST ​/coordenador​/relatorios

- [ ] POST ​/coordenador​/relatorio​/cancelados​/servicos

- [ ] POST ​/coordenador​/relatorio​/cancelados​/servicos​/{idservico}

## Professor

- [x] POST ​/professor​/servicos​/{idservico}​/agendamentos

- [ ] GET ​/professor​/servicos

- [x] GET ​/professor​/servicos​/{idservico}​/agendamentos​/{idagendamento}

- [x] PUT ​/professor​/servicos​/{idservico}​/agendamentos​/{idagendamento}

- [x] DELETE ​/professor​/servicos​/{idservico}​/agendamentos​/{idagendamento}

- [x] POST ​/professor​/agendamentos

## Diretor

- [ ] POST ​/diretor​/relatorios
