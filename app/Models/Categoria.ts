import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'
import Unidade from './Unidade'

export default class Categoria extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public id_coordenador: number

  @column()
  public id_unidade: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Usuario, { foreignKey: 'id_coordenador' })
  public coordenador: BelongsTo<typeof Usuario>

  @belongsTo(() => Unidade, { foreignKey: 'id_unidade' })
  public unidade: BelongsTo<typeof Unidade>
}
