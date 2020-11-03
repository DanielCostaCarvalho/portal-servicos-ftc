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
}