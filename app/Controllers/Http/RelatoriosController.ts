import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Agenda from 'App/Models/Agenda'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Categoria from 'App/Models/Categoria'
import Servico from 'App/Models/Servico'
import { DateTime } from 'luxon'
import Desistencia from 'App/Models/Desistencia'

export default class RelatoriosController {
  public async canceladosServico({ request, response, params }: HttpContextContract) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { data_inicial, data_final, usuario } = request.only([
      'data_inicial',
      'data_final',
      'usuario',
    ])

    const { idServico } = params

    const schemaDaRequisicao = schema.create({
      data_inicial: schema.date({
        format: 'yyyy-MM-dd',
      }),
      data_final: schema.date({
        format: 'yyyy-MM-dd',
      }),
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

    const servico = await Servico.query()
      .select('id', 'nome', 'id_categoria')
      .where('id', idServico)
      .first()

    if (!servico) {
      return response.badRequest({ mensagem: 'O serviço especificado não existe!' })
    }

    const categoria = await Categoria.query()
      .select(['id', 'id_coordenador'])
      .where('id', servico.id_categoria)
      .first()

    if (!categoria || categoria.id_coordenador !== usuario.id) {
      response.forbidden({
        mensagem: 'Esse usuário não tem permissão para visualizar esse serviço!',
      })
    }

    const agendas = await Agenda.query()
      .preload('responsavel_cancelamento', (query) => {
        query.select('nome')
      })
      .select(
        'id',
        'data_hora',
        'atendente',
        'id_responsavel_cancelamento',
        'justificativa_cancelamento',
        'atendido'
      )
      .whereNotNull('id_responsavel_cancelamento')
      .andWhereBetween('data_hora', [
        DateTime.fromISO(data_inicial).toSQLDate(),
        DateTime.fromISO(data_final).toSQLDate(),
      ])
      .where('id_servico', idServico)

    return {
      id: servico.id,
      nome: servico.nome,
      agendas,
    }
  }

  public async servicosCancelados({ request, response }: HttpContextContract) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { data_inicial, data_final, usuario } = request.only([
      'data_inicial',
      'data_final',
      'usuario',
    ])

    const schemaDaRequisicao = schema.create({
      data_inicial: schema.date({
        format: 'yyyy-MM-dd',
      }),
      data_final: schema.date({
        format: 'yyyy-MM-dd',
      }),
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

    const categorias = await Categoria.query().select('id').where('id_coordenador', usuario.id)

    const idCategorias = categorias.map((categoria) => categoria.id)

    const servicos = await Servico.query()
      .preload('agendas', (query) => {
        query
          .whereNotNull('id_responsavel_cancelamento')
          .andWhereBetween('data_hora', [
            DateTime.fromISO(data_inicial).toSQLDate(),
            DateTime.fromISO(data_final).toSQLDate(),
          ])
          .preload('responsavel_cancelamento', (query) => {
            query.select('nome')
          })
      })
      .select('id', 'nome')
      .whereIn('id_categoria', idCategorias)

    return servicos
  }

  public async contagensAgendamentos({ request, response }: HttpContextContract) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { data_inicial, data_final, categorias, status } = request.only([
      'data_inicial',
      'data_final',
      'categorias',
      'status',
      'usuario',
    ])

    const schemaDaRequisicao = schema.create({
      data_inicial: schema.date({
        format: 'yyyy-MM-dd',
      }),
      data_final: schema.date({
        format: 'yyyy-MM-dd',
      }),
      categorias: schema.array().members(
        schema.number([
          rules.exists({
            table: 'categorias',
            column: 'id',
          }),
        ])
      ),
      status: schema
        .array([rules.minLength(1), rules.distinct('*')])
        .members(schema.enum(['cancelado', 'desistente', 'atendido', 'ausente', 'vago'])),
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

    const resposta = categorias.map(async (categoria) => {
      const retornoCategoria = await Categoria.find(categoria)

      const servicos = await Servico.query().select('id').where('id_categoria', categoria)

      const idServicos = servicos.map((servico) => {
        return servico.id
      })

      const quantidadesPromises = status.map((nome) => {
        if (nome === 'cancelado') {
          return Agenda.query()
            .count(`* as ${nome}`)
            .whereIn('id_servico', idServicos)
            .andWhereNotNull('id_responsavel_cancelamento')
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
        if (nome === 'desistente') {
          return Desistencia.query()
            .count(`* as ${nome}`)
            .whereIn('id_servico', idServicos)
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
        if (nome === 'atendido') {
          return Agenda.query()
            .count(`* as ${nome}`)
            .whereIn('id_servico', idServicos)
            .andWhere('atendido', true)
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
        if (nome === 'ausente') {
          return Agenda.query()
            .count(`* as ${nome}`)
            .whereIn('id_servico', idServicos)
            .andWhere('atendido', false)
            .andWhereNotNull('id_cliente')
            .andWhere('data_hora', '<', DateTime.local().toSQL())
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
        if (nome === 'vago') {
          return Agenda.query()
            .count(`* as ${nome}`)
            .whereIn('id_servico', idServicos)
            .andWhereNull('id_cliente')
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
      })

      const quantidades = await Promise.all(quantidadesPromises)

      return {
        nome: retornoCategoria?.nome,
        valores: quantidades,
      }
    })
    const retorno = await Promise.all(resposta)

    return retorno
  }

  public async contagensAgendamentosCoordenador({ request, response }: HttpContextContract) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { data_inicial, data_final, servicos, status, usuario } = request.only([
      'data_inicial',
      'data_final',
      'servicos',
      'status',
      'usuario',
    ])

    const schemaDaRequisicao = schema.create({
      data_inicial: schema.date({
        format: 'yyyy-MM-dd',
      }),
      data_final: schema.date({
        format: 'yyyy-MM-dd',
      }),
      servicos: schema.array().members(
        schema.number([
          rules.exists({
            table: 'servicos',
            column: 'id',
          }),
        ])
      ),
      status: schema
        .array([rules.minLength(1), rules.distinct('*')])
        .members(schema.enum(['cancelado', 'desistente', 'atendido', 'ausente', 'vago'])),
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

    const categorias = await Categoria.query().select('id').where('id_coordenador', usuario.id)

    const categoriasId = categorias.map((categoria) => categoria.id)

    const infoServicos = await Servico.query().whereIn('id', servicos)

    const servicoNaoPertencente = infoServicos.some((servico) => {
      const indiceCategoria = categoriasId.indexOf(servico.id_categoria)
      const isCategoriaNaoEncontrada = indiceCategoria === -1

      return isCategoriaNaoEncontrada
    })

    if (servicoNaoPertencente) {
      return response.forbidden({
        mensagem: 'Foram solicitados serviços para o qual esse usuário não possui acesso!',
      })
    }

    const resposta = servicos.map(async (idServico) => {
      const servico = await Servico.find(idServico)

      const quantidadesPromises = status.map((nome) => {
        if (nome === 'cancelado') {
          return Agenda.query()
            .count(`* as ${nome}`)
            .where('id_servico', idServico)
            .andWhereNotNull('id_responsavel_cancelamento')
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
        if (nome === 'desistente') {
          return Desistencia.query()
            .count(`* as ${nome}`)
            .where('id_servico', idServico)
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
        if (nome === 'atendido') {
          return Agenda.query()
            .count(`* as ${nome}`)
            .where('id_servico', idServico)
            .andWhere('atendido', true)
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
        if (nome === 'ausente') {
          return Agenda.query()
            .count(`* as ${nome}`)
            .where('id_servico', idServico)
            .andWhere('atendido', false)
            .andWhereNotNull('id_cliente')
            .andWhere('data_hora', '<', DateTime.local().toSQL())
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
        if (nome === 'vago') {
          return Agenda.query()
            .count(`* as ${nome}`)
            .where('id_servico', idServico)
            .andWhereNull('id_cliente')
            .andWhereBetween('data_hora', [
              DateTime.fromISO(data_inicial).toSQLDate(),
              DateTime.fromISO(data_final).toSQLDate(),
            ])
            .first()
            .then((retorno) => {
              return { status: nome, quantidade: retorno[nome] }
            })
        }
      })

      const quantidades = await Promise.all(quantidadesPromises)

      return {
        nome: servico?.nome,
        valores: quantidades,
      }
    })
    const retorno = await Promise.all(resposta)

    return retorno
  }
}
