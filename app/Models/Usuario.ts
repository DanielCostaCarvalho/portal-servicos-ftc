import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'

export default class Usuario extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column({})
  public email: string

  @column({})
  public senha: string

  @beforeSave()
  public static async hashPassword (usuario: Usuario) {
    if (usuario.$dirty.senha) {
      usuario.senha = await Hash.hash(usuario.senha)
    }
  }

  @column()
  public tipo: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
