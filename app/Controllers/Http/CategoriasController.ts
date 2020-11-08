import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Categoria from 'App/Models/Categoria'
import Unidade from 'App/Models/Unidade'
import Usuario from 'App/Models/Usuario'
import {
  formatarErroCampoObrigatorio,
  getCampoErroValidacao,
  getErroValidacao,
} from 'App/Utils/Utils'

export default class CategoriasController {
  public async categoriasUnidadeMaster({ response, params }: HttpContextContract) {
    try {
      const idUnidade = params.idUnidade

      const unidade = await Unidade.find(idUnidade)

      if (!unidade) {
        return response.status(401).json({
          mensagem: 'Unidade não encontrada',
        })
      }

      const categorias = await Categoria.query()
        .select(['id', 'nome', 'id_coordenador'])
        .where('id_unidade', idUnidade)
        .preload('coordenador', (query) => {
          query.select(['id', 'nome'])
        })

      return categorias
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async categoriasUnidade({ response, params }: HttpContextContract) {
    try {
      const idUnidade = params.idUnidade

      const unidade = await Unidade.find(idUnidade)

      if (!unidade) {
        return response.status(401).json({
          mensagem: 'Unidade não encontrada',
        })
      }

      const categorias = await Categoria.query()
        .select(['id', 'nome'])
        .where('id_unidade', idUnidade)

      return categorias
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async cadastro({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          nome: schema.string(),
          id_unidade: schema.number(),
          id_coordenador: schema.number(),
        }),
      })

      const usuario = await Usuario.find(request.input('id_coordenador'))

      if (!usuario) {
        return response.status(401).json({
          mensagem: 'Coordenador não encontrado',
        })
      }

      if (usuario?.tipo !== 'Coordenador') {
        return response.status(401).json({
          mensagem:
            'Usuário escolhido para coordenador da categoria não tem essa função cadastrada',
        })
      }

      const unidade = await Unidade.find(request.input('id_unidade'))

      if (!unidade) {
        return response.status(401).json({
          mensagem: 'Unidade não encontrada',
        })
      }

      await Categoria.create({ ...dadosCadastro })

      return response.status(201).json({ mensagem: 'Categoria criada com sucesso' })
    } catch (error) {
      if (getErroValidacao(error) === 'required') {
        const campoErro = getCampoErroValidacao(error)

        const erro = formatarErroCampoObrigatorio(campoErro)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async atualizacao({ request, response, params }: HttpContextContract) {
    try {
      const data = request.only(['nome', 'id_coordenador', 'id_unidade'])

      const categoria = await Categoria.find(params.id)

      if (!categoria) {
        return response.status(401).json({
          mensagem: 'Categoria não encontrada',
        })
      }

      if (data.nome) {
        categoria.nome = data.nome
      }

      if (data.id_coordenador) {
        const usuario = await Usuario.find(data.id_coordenador)

        if (usuario?.tipo !== 'Coordenador') {
          return response.status(401).json({
            mensagem:
              'Usuário escolhido para coordenador da categoria não tem essa função cadastrada',
          })
        }

        categoria.id_coordenador = data.id_coordenador
      }

      if (data.id_unidade) {
        const unidade = await Unidade.find(data.id_unidade)

        if (!unidade) {
          return response.status(401).json({
            mensagem: 'Unidade não encontrada',
          })
        }

        categoria.id_unidade = data.id_unidade
      }

      categoria.save()

      return response.status(201).json({ mensagem: 'Categoria atualizada com sucesso' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async deletar({ response, params }: HttpContextContract) {
    try {
      const categoria = await Categoria.find(params.id)

      if (!categoria) {
        return response.status(401).json({
          mensagem: 'Categoria não encontrada',
        })
      }

      await categoria.delete()

      return response.status(201).json({ mensagem: 'Categoria deletada com sucesso' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async categoriasCoordenador({ request, response }: HttpContextContract) {
    try {
      const usuario: Usuario = request.input('usuario')

      const categorias = await Categoria.query()
        .select(['id', 'nome'])
        .where('id_coordenador', usuario.id)

      return categorias
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async getCategoriaId({ response, params }: HttpContextContract) {
    try {
      const categoria = await Categoria.query()
        .where('id', params.id)
        .select(['id', 'nome', 'id_coordenador', 'id_unidade'])
        .preload('coordenador', (query) => {
          query.select(['id', 'nome'])
        })
        .preload('unidade', (query) => {
          query.select(['id', 'nome'])
        })
        .first()

      if (!categoria) {
        return response.status(401).json({
          mensagem: 'Categoria não encontrada',
        })
      }

      return categoria
    } catch (error) {
      return response.badRequest({ error })
    }
  }
}
