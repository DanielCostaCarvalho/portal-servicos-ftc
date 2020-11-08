import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'
import Servico from './Servico'

export default class Desistencia extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public id_servico: number

  @column()
  public id_cliente: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Servico, { foreignKey: 'id_servico' })
  public servico: BelongsTo<typeof Servico>

  @belongsTo(() => Usuario, { foreignKey: 'id_cliente' })
  public cliente: BelongsTo<typeof Usuario>
}
