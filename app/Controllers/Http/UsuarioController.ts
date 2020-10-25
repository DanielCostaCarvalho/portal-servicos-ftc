import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Usuario from 'App/Models/Usuario'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { gerarTokenJWT, getErroValidacao } from 'App/Utils/Utils'
import Hash from '@ioc:Adonis/Core/Hash'

export default class UsuarioController {
  public async cadastro ({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          nome: schema.string(),
          email: schema.string({}, [
            rules.email(),
            rules.unique({ table: 'usuarios', column: 'email' }),
          ]),
          senha: schema.string({}, [
            rules.minLength(6),
          ]),
        }),
      })

      const usuario = await Usuario.create({
        ...dadosCadastro,
        tipo: 'Cliente',
      })

      const token = gerarTokenJWT(usuario)

      return response.ok({ mensagem: 'Usuário criado com sucesso', usuario, token })
    } catch (error) {
      if (getErroValidacao(error) === 'unique') {
        return response.badRequest({ mensagem: 'Email já registrado' })
      }

      return response.badRequest({ error })
    }
  }

  public async login ({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          email: schema.string({}, [
            rules.exists({
              table: 'usuarios', column: 'email',
            }),
          ]),
          senha: schema.string({}, []),
        }),
      })

      const usuario = await Usuario.query().where({ email: dadosCadastro.email }).firstOrFail()
      const senhaCorreta = await Hash.verify(usuario.senha, request.input('senha'))

      if(senhaCorreta) {
        return response.ok({ token: gerarTokenJWT(usuario) })
      } else {
        return response.status(401).json({ mensagem: 'Credenciais incorretas' })
      }
    } catch (error) {
      if (getErroValidacao(error) === 'exists') {
        return response.status(401).json({ mensagem: 'Email não cadastrado' })
      }

      return response.status(401).badRequest({ mensagem: 'Erro ao fazer login' })
    }
  }
}
