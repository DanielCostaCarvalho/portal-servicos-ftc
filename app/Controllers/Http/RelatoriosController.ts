import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Agenda from 'App/Models/Agenda'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Categoria from 'App/Models/Categoria'
import Servico from 'App/Models/Servico'
import { DateTime } from 'luxon'

export default class RelatoriosController {
  public async servicosCancelados({ request, response, params }: HttpContextContract) {
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
      })
      .select('id', 'nome')
      .whereIn('id_categoria', idCategorias)

    return servicos
  }
}
