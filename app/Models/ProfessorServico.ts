import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Servico from './Servico'
import Usuario from './Usuario'

export default class ProfessorServico extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public id_professor: number

  @column()
  public id_servico: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Servico, {foreignKey: 'id_servico'})
  public servico: BelongsTo<typeof Servico>

  @belongsTo(() => Usuario, {foreignKey: 'id_professor'})
  public professor: BelongsTo<typeof Usuario>
}
