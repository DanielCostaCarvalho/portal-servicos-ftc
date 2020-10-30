import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Usuario from 'App/Models/Usuario'

export default class UsuarioMasterSeeder extends BaseSeeder {
  public async run () {
    await Usuario.create({
      nome: 'Coordenador',
      email: 'coordenador@teste.com',
      senha: '123456',
      tipo: 'Coordenador',
    })
  }
}
