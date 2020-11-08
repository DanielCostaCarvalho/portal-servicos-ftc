import { DateTime } from 'luxon'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import ProfessorServico from 'App/Models/ProfessorServico'
import Agenda from 'App/Models/Agenda'

export default class AgendasController {
  public async coordenadorAbrir({ request, response, params }: HttpContextContract) {
    const { id_professor, dias, hora_inicial, hora_final, duracao } = request.only([
      'dias',
      'hora_inicial',
      'hora_final',
      'duracao',
      'id_professor',
    ])
    const { idServico } = params

    const schemaDaRequisicao = schema.create({
      dias: schema.array([rules.minLength(1)]).members(
        schema.date({
          format: 'yyyy-MM-dd',
        })
      ),
      hora_inicial: schema.date({
        format: 'HH:mm',
      }),
      hora_final: schema.date({
        format: 'HH:mm',
      }),
      duracao: schema.number([rules.unsigned()]),
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

    if (!idServico) {
      return response.badRequest({ mensagem: 'Rota inválida' })
    }

    const horaInicial = DateTime.fromISO(hora_inicial)
    const horaFinal = DateTime.fromISO(hora_final)

    if (horaInicial > horaFinal) {
      return response.badRequest({ mensagem: 'A hora inicial não pode ser maior que a hora final' })
    }

    const professorServico = await ProfessorServico.query()
      .where('id_professor', '=', id_professor)
      .andWhere('id_servico', '=', idServico)
      .first()

    if (!professorServico) {
      return response.badRequest({
        mensagem: 'O professor não existe, ou não está vinculado a esse serviço',
      })
    }

    const horarios: any = []

    let novaMarcacao = DateTime.fromObject(horaInicial.toObject())
    while (novaMarcacao < horaFinal) {
      horarios.push(novaMarcacao.toFormat('HH:mm'))
      novaMarcacao = novaMarcacao.plus({ minutes: duracao })
    }

    const arrayAgendas = dias.map((dia) => {
      const datasCompletas = horarios.map((horario) => {
        return `${dia}T${horario}`
      })
      return datasCompletas
    })

    const datasAgendas = arrayAgendas.reduce((novoArray, array) => {
      novoArray.push(...array)
      return novoArray
    })

    const agendas = datasAgendas.map((data) => {
      return { id_servico: idServico, data_hora: data, id_professor_responsavel: id_professor }
    })

    try {
      await Agenda.createMany(agendas)
      return response.status(201)
    } catch (error) {
      return response
        .status(500)
        .send({ mensagem: 'Ocorreu um erro interno ao salvar as agendas!' })
    }
  }

  public async professorAbrir({ request, response, params }: HttpContextContract) {
    const { dias, hora_inicial, hora_final, duracao, usuario } = request.only([
      'dias',
      'hora_inicial',
      'hora_final',
      'duracao',
      'usuario',
    ])
    const { idServico } = params

    const schemaDaRequisicao = schema.create({
      dias: schema.array([rules.minLength(1)]).members(
        schema.date({
          format: 'yyyy-MM-dd',
        })
      ),
      hora_inicial: schema.date({
        format: 'HH:mm',
      }),
      hora_final: schema.date({
        format: 'HH:mm',
      }),
      duracao: schema.number([rules.unsigned()]),
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

    if (!idServico) {
      return response.badRequest({ mensagem: 'Rota inválida' })
    }

    const horaInicial = DateTime.fromISO(hora_inicial)
    const horaFinal = DateTime.fromISO(hora_final)

    if (horaInicial > horaFinal) {
      return response.badRequest({ mensagem: 'A hora inicial não pode ser maior que a hora final' })
    }

    const professorServico = await ProfessorServico.query()
      .where('id_professor', '=', usuario.id)
      .andWhere('id_servico', '=', idServico)
      .first()

    if (!professorServico) {
      return response.badRequest({
        mensagem: 'O professor não existe, ou não está vinculado a esse serviço',
      })
    }

    const horarios: any = []

    let novaMarcacao = DateTime.fromObject(horaInicial.toObject())
    while (novaMarcacao < horaFinal) {
      horarios.push(novaMarcacao.toFormat('HH:mm'))
      novaMarcacao = novaMarcacao.plus({ minutes: duracao })
    }

    const arrayAgendas = dias.map((dia) => {
      const datasCompletas = horarios.map((horario) => {
        return `${dia}T${horario}`
      })
      return datasCompletas
    })

    const datasAgendas = arrayAgendas.reduce((novoArray, array) => {
      novoArray.push(...array)
      return novoArray
    })

    const agendas = datasAgendas.map((data) => {
      return { id_servico: idServico, data_hora: data, id_professor_responsavel: usuario.id }
    })

    try {
      await Agenda.createMany(agendas)
      return response.status(201)
    } catch (error) {
      return response
        .status(500)
        .send({ mensagem: 'Ocorreu um erro interno ao salvar as agendas!' })
    }
  }

  public async professorBuscar({ request, response, params }: HttpContextContract) {
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

    const agendas = await Agenda.query()
      .preload('cliente', (query) => {
        query.select(['id', 'nome', 'id_professor_responsavel', 'id_responsavel_cancelamento'])
      })
      .preload('professor_responsavel', (query) => {
        query.select(['id', 'nome'])
      })
      .preload('responsavel_cancelamento', (query) => {
        query.select(['id', 'nome'])
      })
      .select('id, data_hora, atendente, observacao, justificativa_cancelamento, atendido')
      .where('id_professor_responsavel', usuario.id)
      .andWhereBetween('data_hora', [
        DateTime.fromISO(data_inicial).toSQLDate(),
        DateTime.fromISO(data_final).toSQLDate(),
      ])

    return agendas
  }

  public async professorDetalhes({ request, response, params }: HttpContextContract) {
    const { usuario } = request.only(['usuario'])
    const { idServico, idAgendamento } = params

    const professorServico = await ProfessorServico.query()
      .where('id_professor', '=', usuario.id)
      .andWhere('id_servico', '=', idServico)
      .first()

    if (!professorServico) {
      return response.forbidden({
        mensagem: 'O professor não está vinculado a esse serviço',
      })
    }

    const agendamento = await Agenda.query()
      .preload('professor_responsavel')
      .preload('responsavel_cancelamento')
      .preload('cliente')
      .where('id', '=', idAgendamento)
      .andWhere('id_servico', '=', idServico)
      .first()

    if (!agendamento) {
      return response.badRequest({
        mensagem: 'Não foi encontrado o agendamento com os dados solicitados',
      })
    }

    return agendamento
  }

  public async professorCancelamento({ request, response, params }: HttpContextContract) {
    const { usuario, justificativa } = request.only(['usuario', 'justificativa'])
    const { idServico, idAgendamento } = params

    const schemaDaRequisicao = schema.create({
      justificativa: schema.string({}, [rules.minLength(5)]),
    })

    try {
      await request.validate({
        schema: schemaDaRequisicao,
        messages: {
          required: 'O campo {{ field }} é obrigatório',
          minLength: 'É preciso de uma justificativa maior',
        },
      })
    } catch (erros) {
      return response.badRequest({ mensagem: 'Dados inválidos!', erros })
    }

    const professorServico = await ProfessorServico.query()
      .where('id_professor', '=', usuario.id)
      .andWhere('id_servico', '=', idServico)
      .first()

    if (!professorServico) {
      return response.forbidden({
        mensagem: 'O professor não está vinculado a esse serviço',
      })
    }

    const agendamento = await Agenda.query()
      .preload('professor_responsavel')
      .preload('responsavel_cancelamento')
      .preload('cliente')
      .where('id', '=', idAgendamento)
      .andWhere('id_servico', '=', idServico)
      .andWhere('id_professor_responsavel', '=', usuario.id)
      .first()

    if (!agendamento) {
      return response.badRequest({
        mensagem: 'Não foi encontrado o agendamento com os dados solicitados',
      })
    }

    if (agendamento.atendido) {
      return response.badRequest({
        mensagem: 'Impossível cancelar a agenda uma vez que o atendimento já foi realizado',
      })
    }

    agendamento.id_responsavel_cancelamento = usuario.id
    agendamento.justificativa_cancelamento = justificativa

    await agendamento.save()

    return response.status(204)
  }

  public async professorAlteracao({ request, response, params }: HttpContextContract) {
    const { observacao, atendente, atendido, usuario } = request.only([
      'observacao',
      'atendente',
      'atendido',
      'usuario',
    ])
    const { idServico, idAgendamento } = params

    const schemaDaRequisicao = schema.create({
      observacao: schema.string(),
      atendente: schema.string(),
      atendido: schema.boolean(),
    })

    try {
      await request.validate({
        schema: schemaDaRequisicao,
        messages: {
          required: 'O campo {{ field }} é obrigatório',
        },
      })
    } catch (erros) {
      return response.badRequest({ mensagem: 'Dados inválidos!', erros })
    }

    const professorServico = await ProfessorServico.query()
      .where('id_professor', '=', usuario.id)
      .andWhere('id_servico', '=', idServico)
      .first()

    if (!professorServico) {
      return response.forbidden({
        mensagem: 'O professor não está vinculado a esse serviço',
      })
    }

    const agendamento = await Agenda.query()
      .preload('professor_responsavel')
      .preload('responsavel_cancelamento')
      .preload('cliente')
      .where('id', '=', idAgendamento)
      .andWhere('id_servico', '=', idServico)
      .andWhere('id_professor_responsavel', '=', usuario.id)
      .first()

    if (!agendamento) {
      return response.badRequest({
        mensagem: 'Não foi encontrado o agendamento com os dados solicitados',
      })
    }

    agendamento.atendido = atendido
    agendamento.atendente = atendente
    agendamento.observacao = observacao

    await agendamento.save()

    return response.status(204)
  }

  public async clienteBuscaMes({ request, response, params }: HttpContextContract) {
    const { mes } = request.only(['mes'])
    const { idServico } = params

    const schemaDaRequisicao = schema.create({
      mes: schema.date({
        format: 'yyyy-MM',
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

    if (!idServico) {
      return response.badRequest({ mensagem: 'Rota inválida' })
    }

    const mesInicial = DateTime.fromISO(mes)
    const mesFinal = DateTime.fromObject(mesInicial.toObject()).plus({ month: 1 })

    const agendas = await Agenda.query()
      .select('id', 'data_hora', 'duracao', 'atendente')
      .whereBetween('data_hora', [mesInicial.toSQL(), mesFinal.toSQL()])
      .andWhereNull('id_cliente')

    return agendas
  }

  public async clienteAgendar({ request, response, params }: HttpContextContract) {
    const { usuario } = request.only(['mes'])
    const { idAgendamento } = params

    if (!idAgendamento) {
      return response.badRequest({ mensagem: 'Rota inválida' })
    }

    const agenda = await Agenda.find(idAgendamento)

    if (!agenda) {
      return response.badRequest({ mensagem: 'Não existe esse agendamento' })
    }

    if (agenda.id_cliente == usuario.id) {
      return response.status(201)
    }

    if (agenda.id_cliente) {
      return response.conflict({
        mensagem: 'Horário já agendado anteriormente. Tente novamente em outro horário.',
      })
    }

    agenda.id_cliente = usuario.id

    await agenda.save()

    return response.status(201)
  }

  public async clienteBuscar({ request, response, params }: HttpContextContract) {
    const { usuario } = request.only(['usuario'])

    const agendas = await Agenda.query()
      .preload('cliente', (query) => {
        query.select([
          'id',
          'nome',
          'data_hora',
          'atendente',
          'atendido',
          'justificativa_cancelamento',
          'id_responsavel_cancelamento',
        ])
      })
      .preload('responsavel_cancelamento', (query) => {
        query.select(['id', 'nome'])
      })
      .select('id, data_hora, atendente, observacao, justificativa_cancelamento, atendido')
      .where('id_cliente', usuario.id)

    return agendas
  }
}
