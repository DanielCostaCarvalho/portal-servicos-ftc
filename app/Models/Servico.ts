import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Categoria from './Categoria'
import Usuario from './Usuario'
import Agenda from './Agenda'

export default class Servico extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public id_categoria: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Categoria, { foreignKey: 'id_categoria' })
  public categoria: BelongsTo<typeof Categoria>

  @manyToMany(() => Usuario, {
    pivotForeignKey: 'id_servico',
    pivotTable: 'professor_servicos',
    pivotRelatedForeignKey: 'id_professor',
  })
  public professores: ManyToMany<typeof Usuario>

  @hasMany(() => Agenda, {
    foreignKey: 'id_servico',
  })
  public agendas: HasMany<typeof Agenda>
}
