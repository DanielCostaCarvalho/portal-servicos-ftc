import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'
import Servico from './Servico'

export default class Agenda extends BaseModel {
  public static table = 'agendas'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime()
  public data_hora: DateTime

  @column()
  public id_servico: number

  @column()
  public id_cliente: number | null

  @column()
  public atendente: string

  @column()
  public id_professor_responsavel: number

  @column()
  public id_responsavel_cancelamento: number

  @column()
  public justificativa_cancelamento: string

  @column()
  public observacao: string

  @column()
  public atendido: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Servico, { foreignKey: 'id_servico' })
  public servico: BelongsTo<typeof Servico>

  @belongsTo(() => Usuario, { foreignKey: 'id_cliente' })
  public cliente: BelongsTo<typeof Usuario>

  @belongsTo(() => Usuario, { foreignKey: 'id_professor_responsavel' })
  public professor_responsavel: BelongsTo<typeof Usuario>

  @belongsTo(() => Usuario, { foreignKey: 'id_responsavel_cancelamento' })
  public responsavel_cancelamento: BelongsTo<typeof Usuario>
}
