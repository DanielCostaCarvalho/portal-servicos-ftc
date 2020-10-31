import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Postagem from 'App/Models/Postagem'
import Unidade from 'App/Models/Unidade'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Usuario from 'App/Models/Usuario'
import Categoria from 'App/Models/Categoria'
import {
  formatarErroCampoObrigatorio,
  getCampoErroValidacao, getErroValidacao,
  getMensagemErro,
  existeErroValidacao,
}
  from 'App/Utils/Utils'

export default class PostagensController {
  public async postagensUnidadeMaster ({ response, params }: HttpContextContract) {
    try {
      const idUnidade = params.idUnidade

      const unidade = await Unidade.find(idUnidade)

      if(!unidade) {
        return response.status(401).json({
          'mensagem': 'Unidade não encontrada',
        })
      }

      const categorias = await Postagem.query().select(['id', 'titulo', 'mensagem', 'ativa', 'id_categoria'])
        .where('id_unidade', idUnidade)
        .preload('categoria', (query) => {
          query.select(['id', 'nome'])
        })

      return categorias
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async cadastroMaster ({ request, response }: HttpContextContract) {
    try {
      const data = request.only(['id_categoria', 'ativa', 'data_expiracao'])

      const dadosCadastro = await request.validate({
        schema: schema.create({
          titulo: schema.string(),
          mensagem: schema.string(),
          id_categoria: schema.number([
            rules.exists({ table: 'categorias', column: 'id' }),
          ]),
          ...(data.ativa !== undefined && { ativa: schema.boolean() }),
          ...(data.data_expiracao !== undefined && { data_expiracao: schema.date() }),
        }),
        messages: {
          'id_categoria.exists': 'Categoria não encontrada',
          'ativa.boolean': 'Informe true ou false para o campo ativa',
          'data_expiracao.date': 'O campo de data de expiração não está no formato correto',
        },
      })

      const categoria = await Categoria.find(data.id_categoria)

      const usuario: Usuario = request.input('usuario')

      await Postagem.create({
        ...dadosCadastro,
        id_unidade: categoria?.id_unidade,
        id_categoria: categoria?.id,
        id_usuario: usuario.id,
        ativa: data.ativa !== null? true: false,
        data_expiracao:  data.data_expiracao !== null? data.data_expiracao : null,
      })

      return response.status(201).json({ mensagem: 'Postagem criada com sucesso' })
    } catch (error) {
      // console.log(error.error)
      const tipoErro = getErroValidacao(error)

      if (tipoErro === 'required') {
        const campoErro = getCampoErroValidacao(error)

        const erro = formatarErroCampoObrigatorio(campoErro)

        return response.status(401).json(erro)
      }

      if(existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async atualizacaoMaster ({ request, response, params }: HttpContextContract) {
    try {
      const data = request.only(['titulo', 'mensagem', 'id_categoria', 'ativa', 'data_expiracao'])

      await request.validate({
        schema: schema.create({
          ...(data.id_categoria !== undefined && {id_categoria: schema.number([
            rules.exists({ table: 'categorias', column: 'id' }),
          ])}),
          ...(data.ativa !== undefined && { ativa: schema.boolean() }),
          ...(data.data_expiracao !== undefined && { data_expiracao: schema.date() }),
        }),
        messages: {
          'id_categoria.exists': 'Categoria não encontrada',
          'ativa.boolean': 'Informe true ou false para o campo ativa',
          'data_expiracao.date': 'O campo de data de expiração não está no formato correto',
        },
      })

      const postagem = await Postagem.find(params.id)

      if(!postagem) {
        return response.status(401).json({
          'mensagem': 'Postagem não encontrada',
        })
      }

      if(data.titulo) {
        postagem.titulo = data.titulo
      }

      if(data.id_categoria !== undefined) {
        postagem.id_categoria = data.id_categoria

        const categoria = await Categoria.findOrFail(data.id_categoria)

        postagem.id_unidade = categoria?.id_unidade
      }

      if(data.mensagem) {
        postagem.mensagem = data.mensagem
      }

      if(data.ativa !== null && data.ativa !== undefined) {
        postagem.ativa = data.ativa
      }

      if(data.data_expiracao !== null && data.data_expiracao !== undefined) {
        postagem.data_expiracao = data.data_expiracao
      }

      postagem.save()

      return response.status(201).json({ mensagem: 'Postagem atualizada com sucesso' })
    } catch (error) {
      if(existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async deletarMaster ({ response, params }: HttpContextContract) {
    try {
      const postagem = await Postagem.find(params.id)

      if(!postagem) {
        return response.status(401).json({
          'mensagem': 'Postagem não encontrada',
        })
      }

      await postagem.delete()

      return response.status(201).json({ mensagem: 'Postagem deletada com sucesso' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }
}
