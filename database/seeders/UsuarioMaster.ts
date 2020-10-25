import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Usuario from 'App/Models/Usuario'

export default class UsuarioMasterSeeder extends BaseSeeder {
  public async run () {
    await Usuario.create({
      nome: 'Master',
      email: 'master@teste.com',
      senha: '123456',
      tipo: 'Master',
    })
  }
}
