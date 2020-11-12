import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Postagem from 'App/Models/Postagem'
import Unidade from 'App/Models/Unidade'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Usuario from 'App/Models/Usuario'
import Categoria from 'App/Models/Categoria'
import {
  formatarErroCampoObrigatorio,
  getCampoErroValidacao,
  getErroValidacao,
  getMensagemErro,
  existeErroValidacao,
} from 'App/Utils/Utils'

export default class PostagensController {
  public async postagensUnidadeMaster({ response, params }: HttpContextContract) {
    try {
      const idUnidade = params.idUnidade

      const unidade = await Unidade.find(idUnidade)

      if (!unidade) {
        return response.status(401).json({
          mensagem: 'Unidade não encontrada',
        })
      }

      const categorias = await Postagem.query()
        .select(['id', 'titulo', 'mensagem', 'ativa', 'data_expiracao', 'id_categoria'])
        .where('id_unidade', idUnidade)
        .preload('categoria', (query) => {
          query.select(['id', 'nome'])
        })

      return categorias
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async postagensUnidade({ response, params }: HttpContextContract) {
    try {
      const idUnidade = params.idUnidade

      const unidade = await Unidade.find(idUnidade)

      if (!unidade) {
        return response.status(401).json({
          mensagem: 'Unidade não encontrada',
        })
      }

      const categorias = await Postagem.query()
        .select(['id', 'titulo', 'mensagem', 'ativa', 'data_expiracao'])
        .where('id_unidade', idUnidade)

      return categorias
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async cadastroMaster({ request, response }: HttpContextContract) {
    try {
      const data = request.only(['id_categoria', 'ativa', 'data_expiracao'])

      const dadosCadastro = await request.validate({
        schema: schema.create({
          titulo: schema.string(),
          mensagem: schema.string(),
          id_categoria: schema.number([rules.exists({ table: 'categorias', column: 'id' })]),
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
        ativa: data.ativa !== null ? true : false,
        data_expiracao: data.data_expiracao !== null ? data.data_expiracao : null,
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

      if (existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async atualizacaoMaster({ request, response, params }: HttpContextContract) {
    try {
      const data = request.only(['titulo', 'mensagem', 'id_categoria', 'ativa', 'data_expiracao'])

      await request.validate({
        schema: schema.create({
          ...(data.id_categoria !== undefined && {
            id_categoria: schema.number([rules.exists({ table: 'categorias', column: 'id' })]),
          }),
          ...(data.ativa !== undefined && { ativa: schema.boolean() }),
          ...(data.data_expiracao !== undefined &&
            data.data_expiracao !== null && { data_expiracao: schema.date() }),
        }),
        messages: {
          'id_categoria.exists': 'Categoria não encontrada',
          'ativa.boolean': 'Informe true ou false para o campo ativa',
          'data_expiracao.date': 'O campo de data de expiração não está no formato correto',
        },
      })

      const postagem = await Postagem.find(params.id)

      if (!postagem) {
        return response.status(401).json({
          mensagem: 'Postagem não encontrada',
        })
      }

      if (data.titulo) {
        postagem.titulo = data.titulo
      }

      if (data.id_categoria !== undefined) {
        postagem.id_categoria = data.id_categoria

        const categoria = await Categoria.findOrFail(data.id_categoria)

        postagem.id_unidade = categoria?.id_unidade
      }

      if (data.mensagem) {
        postagem.mensagem = data.mensagem
      }

      if (data.ativa !== null && data.ativa !== undefined) {
        postagem.ativa = data.ativa
      }

      if (data.data_expiracao !== undefined) {
        postagem.data_expiracao = data.data_expiracao
      }

      postagem.save()

      return response.status(201).json({ mensagem: 'Postagem atualizada com sucesso' })
    } catch (error) {
      if (existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async deletarMaster({ response, params }: HttpContextContract) {
    try {
      const postagem = await Postagem.find(params.id)

      if (!postagem) {
        return response.status(401).json({
          mensagem: 'Postagem não encontrada',
        })
      }

      await postagem.delete()

      return response.status(201).json({ mensagem: 'Postagem deletada com sucesso' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async getPostagemId({ response, params }: HttpContextContract) {
    try {
      const postagem = await Postagem.query()
        .where('id', params.id)
        .select([
          'id',
          'titulo',
          'mensagem',
          'ativa',
          'data_expiracao',
          'id_unidade',
          'id_categoria',
        ])
        .first()

      if (!postagem) {
        return response.status(401).json({
          mensagem: 'Postagem não encontrada',
        })
      }

      return postagem
    } catch (error) {
      return response.badRequest({ error })
    }
  }
  public async coordenadorBuscar({ request }: HttpContextContract) {
    const { usuario } = request.only(['usuario'])

    const categorias = await Categoria.query().select('id').where('id_coordenador', '=', usuario.id)

    const idCategorias = categorias.map((cat) => cat.id)

    const postagens = await Postagem.query().whereIn('id_categoria', idCategorias)

    return postagens
  }

  public async coordenadorCriar({ request, response }: HttpContextContract) {
    const { titulo, mensagem, id_categoria, ativa, data_expiracao, usuario } = request.only([
      'dias',
      'hora_inicial',
      'hora_final',
      'duracao',
      'id_professor',
      'usuario',
    ])

    const schemaDaRequisicao = schema.create({
      titulo: schema.string(),
      mensagem: schema.string(),
      id_categoria: schema.number([rules.unsigned()]),
      ativa: schema.boolean(),
      data_expiracao: schema.date(),
    })

    try {
      await request.validate({
        schema: schemaDaRequisicao,
        messages: {
          required: 'O campo {{ field }} é obrigatório',
          format: 'É obrigatório que o campo {{ date }} esteja no formato {{ format }}',
        },
      })
    } catch (erros) {
      return response.badRequest({ mensagem: 'Dados inválidos!', erros })
    }

    const categoria = await Categoria.find(id_categoria)

    if (!categoria) {
      return response.badRequest({ mensagem: 'A categoria selecionada não existe' })
    }

    if (categoria.id_coordenador != usuario.id) {
      return response.forbidden({
        mensagem: 'Você não tem permissão para criar uma postagem para essa categoria',
      })
    }

    await Postagem.create({
      titulo,
      mensagem,
      id_unidade: categoria.id,
      id_categoria: categoria.id,
      ativa,
      data_expiracao,
    })

    return response.status(201)
  }

  public async coordenadorEditar({ request, response, params }: HttpContextContract) {
    const { titulo, mensagem, ativa, data_expiracao, usuario } = request.only([
      'dias',
      'hora_inicial',
      'hora_final',
      'duracao',
      'id_professor',
      'usuario',
    ])

    const schemaDaRequisicao = schema.create({
      titulo: schema.string(),
      mensagem: schema.string(),
      id_categoria: schema.number([rules.unsigned()]),
      ativa: schema.boolean(),
      data_expiracao: schema.date(),
    })

    try {
      await request.validate({
        schema: schemaDaRequisicao,
        messages: {
          required: 'O campo {{ field }} é obrigatório',
          format: 'É obrigatório que o campo {{ date }} esteja no formato {{ format }}',
        },
      })
    } catch (erros) {
      return response.badRequest({ mensagem: 'Dados inválidos!', erros })
    }

    const { idPostagem } = params

    const postagem = await Postagem.query().preload('categoria').where('id', idPostagem).first()

    if (!postagem) {
      return response.badRequest({ mensagem: 'A postagem selecionada não existe' })
    }

    if (postagem.categoria.id_coordenador != usuario.id) {
      return response.forbidden({
        mensagem: 'Você não tem permissão para criar uma postagem para essa categoria',
      })
    }

    if (titulo) {
      postagem.titulo = titulo
    }

    if (mensagem) {
      postagem.mensagem = mensagem
    }

    if (ativa !== null && ativa !== undefined) {
      postagem.ativa = ativa
    }

    if (data_expiracao !== undefined) {
      postagem.data_expiracao = data_expiracao
    }

    await postagem.save()

    return response.status(201)
  }

  public async coordenadorDeletar({ request, response, params }: HttpContextContract) {
    const { usuario } = request.only(['usuario'])

    const { idPostagem } = params

    const postagem = await Postagem.query().preload('categoria').where('id', idPostagem).first()

    if (!postagem) {
      return response.badRequest({ mensagem: 'A postagem selecionada não existe' })
    }

    if (postagem.categoria.id_coordenador != usuario.id) {
      return response.forbidden({
        mensagem: 'Você não tem permissão para criar uma postagem para essa categoria',
      })
    }

    await postagem.delete()

    return response.status(201)
  }
}
