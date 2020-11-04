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

# Status das rotas:

## Autenticação

Para se autenticar na API

- [ ] POST ​/autenticacao
- [ ] POST ​/cadastro

## Administrador master

- [ ] POST ​/master​/unidades

- [ ] GET ​/master​/unidades

- [ ] GET ​/master​/unidades​/{idunidade}

- [ ] PUT ​/master​/unidades​/{idunidade}

- [ ] DELETE ​/master​/unidades​/{idunidade}

- [ ] GET ​/master​/unidades​/{idunidade}​/categorias

- [ ] POST ​/master​/categorias

- [ ] GET ​/master​/categorias​/{idcategoria}

- [ ] PUT ​/master​/categorias​/{idcategoria}

- [ ] DELETE ​/master​/categorias​/{idcategoria}

- [ ] GET ​/master​/unidades​/{idunidade}​/postagens

- [ ] POST ​/master​/postagens

- [ ] GET ​/master​/postagens​/{idpostagem}

- [ ] PUT ​/master​/postagens​/{idpostagem}

- [ ] DELETE ​/master​/postagens​/{idpostagem}

- [ ] GET ​/master​/usuarios

- [ ] POST ​/master​/usuarios

- [ ] GET ​/master​/usuarios​/{idusuario}

- [ ] PUT ​/master​/usuarios​/{idusuario}

- [ ] DELETE ​/master​/usuarios​/{idusuario}

- [ ] GET ​/master​/usuarios​/{tipousuario}

## Cliente/Paciente

- [ ] GET ​/cliente​/unidades
- [ ] GET ​/cliente​/unidades​/{idunidade}​/postagens
- [ ] GET ​/cliente​/unidades​/{idunidade}​/categorias
- [ ] GET ​/cliente​/categorias​/{idcategoria}​/servicos
- [ ] POST ​/cliente​/servicos​/{idservico}​/agendas
- [ ] POST ​/cliente​/servicos​/agendamento​/{idagenda}

- [ ] GET ​/cliente​/agendamentos

- [ ] POST ​/cliente​/agendamentos​/{idagendamento}​/cancelar

## Coordenador

- [ ] GET ​/coordenador​/categorias

- [ ] GET ​/coordenador​/categorias​/{idcategoria}​/servicos

- [ ] POST ​/coordenador​/servicos​/{idservico}

- [ ] PUT ​/coordenador​/servicos​/{idservico}

- [ ] DELETE ​/coordenador​/servicos​/{idservico}

- [ ] POST ​/coordenador​/servicos​/{idservico}​/professores​/{idprofessor}

- [ ] DELETE ​/coordenador​/servicos​/{idservico}​/professores​/{idprofessor}

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

- [ ] GET ​/professor​/servicos​/{idservico}​/agendamentos​/{idagendamento}

- [ ] PUT ​/professor​/servicos​/{idservico}​/agendamentos​/{idagendamento}

- [ ] DELETE ​/professor​/servicos​/{idservico}​/agendamentos​/{idagendamento}

- [ ] POST ​/professor​/agendamentos

## Diretor

- [ ] POST ​/diretor​/relatorios
