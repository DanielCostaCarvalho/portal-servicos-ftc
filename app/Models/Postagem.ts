import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'
import Unidade from './Unidade'
import Categoria from './Categoria'

export default class Postagem extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public mensagem: string

  @column()
  public ativa: boolean

  @column.dateTime()
  public data_expiracao: DateTime

  @column()
  public id_categoria: number

  @column()
  public id_unidade: number

  @column()
  public id_usuario: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Categoria, {foreignKey: 'id_categoria'})
  public categoria: BelongsTo<typeof Categoria>

  @belongsTo(() => Unidade, {foreignKey: 'id_unidade'})
  public unidade: BelongsTo<typeof Unidade>

  @belongsTo(() => Usuario, {foreignKey: 'id_usuario'})
  public usuario: BelongsTo<typeof Usuario>
}
