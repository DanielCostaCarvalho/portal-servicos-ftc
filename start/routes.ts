/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('cadastro', 'UsuariosController.cadastro')
Route.post('autenticacao', 'UsuariosController.login')

Route.group(() => {
  Route.post('unidades', 'UnidadesController.cadastro')
  Route.get('unidades', 'UnidadesController.getUnidadesMaster')
  Route.get('unidades/:id', 'UnidadesController.getUnidadeId')
  Route.put('unidades/:id', 'UnidadesController.atualizacao')
  Route.delete('unidades/:id', 'UnidadesController.deletar')
  Route.get('unidades/:idUnidade/categorias', 'CategoriasController.categoriasUnidadeMaster')
  Route.post('categorias', 'CategoriasController.cadastro')
  Route.get('categorias/:id', 'CategoriasController.getCategoriaId')
  Route.put('categorias/:id', 'CategoriasController.atualizacao')
  Route.delete('categorias/:id', 'CategoriasController.deletar')
  Route.get('unidades/:idUnidade/postagens', 'PostagensController.postagensUnidadeMaster')
  Route.post('postagens', 'PostagensController.cadastroMaster')
  Route.get('postagens/:id', 'PostagensController.getPostagemId')
  Route.put('postagens/:id', 'PostagensController.atualizacaoMaster')
  Route.delete('postagens/:id', 'PostagensController.deletarMaster')
  Route.get('usuarios', 'UsuariosController.listagem')
  Route.get('usuarios/tipo/:tipo', 'UsuariosController.listagemPorTipo')
  Route.post('usuarios', 'UsuariosController.cadastroMaster')
  Route.get('usuarios/:id', 'UsuariosController.getUsuarioId')
  Route.put('usuarios/:id', 'UsuariosController.atualizarMaster')
  Route.delete('usuarios/:id', 'UsuariosController.deletarMaster')
})
  .prefix('master')
  .middleware(['jwt', 'master'])

Route.group(() => {
  Route.get('categorias', 'CategoriasController.categoriasCoordenador')
  Route.get('categorias/:idCategoria/servicos', 'ServicosController.servicosCoordenador')
  Route.post('servicos', 'ServicosController.cadastro')
  Route.put('servicos/:id', 'ServicosController.atualizacao')
  Route.delete('servicos/:id', 'ServicosController.deletar')
  Route.post(
    'servicos/:idServico/professores/:idProfessor',
    'ServicosController.vincularProfessorServico'
  )
  Route.delete(
    'servicos/:idServico/professores/:idProfessor',
    'ServicosController.desvincularProfessorServico'
  )
  Route.post('servicos/:idServico/agendamentos', 'AgendasController.coordenadorAbrir')
})
  .prefix('coordenador')
  .middleware(['jwt', 'coordenador'])

Route.group(() => {
  Route.post('servicos/:idServico/agendamentos', 'AgendasController.professorAbrir')
})
  .prefix('professor')
  .middleware(['jwt', 'professor'])
