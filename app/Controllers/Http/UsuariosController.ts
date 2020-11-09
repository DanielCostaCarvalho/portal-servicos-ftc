import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Usuario from 'App/Models/Usuario'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import {
  existeErroValidacao,
  gerarTokenJWT,
  getErroValidacao,
  getMensagemErro,
  capitalize,
} from 'App/Utils/Utils'
import Hash from '@ioc:Adonis/Core/Hash'

export default class UsuarioController {
  public async cadastro({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          nome: schema.string(),
          email: schema.string({}, [
            rules.email(),
            rules.unique({ table: 'usuarios', column: 'email' }),
          ]),
          senha: schema.string({}, [rules.minLength(6)]),
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

  public async login({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          email: schema.string({}, [
            rules.exists({
              table: 'usuarios',
              column: 'email',
            }),
          ]),
          senha: schema.string({}, []),
        }),
      })

      const usuario = await Usuario.query().where({ email: dadosCadastro.email }).firstOrFail()
      const senhaCorreta = await Hash.verify(usuario.senha, request.input('senha'))

      if (senhaCorreta) {
        return response.ok({ token: gerarTokenJWT(usuario) })
      } else {
        return response.status(401).json({ mensagem: 'Credenciais incorretas' })
      }
    } catch (error) {
      if (getErroValidacao(error) === 'exists') {
        return response.status(401).json({ mensagem: 'E-mail não cadastrado' })
      }

      return response.status(401).badRequest({ mensagem: 'Erro ao fazer login' })
    }
  }

  public async listagem({ response }: HttpContextContract) {
    try {
      return await Usuario.query().select(['id', 'nome', 'email', 'tipo'])
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async getUsuarioId({ response, params }: HttpContextContract) {
    try {
      const usuario = await Usuario.query()
        .where('id', params.id)
        .select(['id', 'nome', 'email', 'tipo'])
        .first()

      if (!usuario) {
        return response.status(401).json({
          mensagem: 'Usuário não encontrado',
        })
      }

      return usuario
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async listagemPorTipo({ response, params }: HttpContextContract) {
    try {
      const tipo = capitalize(params.tipo)

      const tipos = ['Cliente', 'Diretor', 'Coordenador', 'Master', 'Professor']

      if (!tipos.includes(tipo)) {
        return response.status(401).json({
          mensagem: 'O tipo de usuário informado não foi reconhecido',
        })
      }

      return await Usuario.query().select(['id', 'nome', 'email', 'tipo']).where('tipo', tipo)
    } catch (error) {
      console.log(error)
      return response.badRequest({ error })
    }
  }

  public async cadastroMaster({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          nome: schema.string(),
          email: schema.string({}, [
            rules.email(),
            rules.unique({ table: 'usuarios', column: 'email' }),
          ]),
          senha: schema.string({}, [rules.minLength(6)]),
          tipo: schema.enum(['Cliente', 'Diretor', 'Coordenador', 'Master', 'Professor']),
        }),
        messages: {
          // eslint-disable-next-line max-len
          'tipo.enum': `Tipo de usuário não informado corretamente. Os tipos são Cliente, Diretor, Coordenador, Master e Professor`,
          'email.email': 'Informe um e-mail válido',
        },
      })

      await Usuario.create({
        ...dadosCadastro,
      })

      return response.ok({ mensagem: 'Usuário criado com sucesso' })
    } catch (error) {
      if (getErroValidacao(error) === 'unique') {
        return response.badRequest({ mensagem: 'Email já registrado' })
      }

      if (existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ error })
    }
  }

  public async atualizarMaster({ request, response, params }: HttpContextContract) {
    try {
      const data = request.only(['nome', 'email', 'tipo'])

      await request.validate({
        schema: schema.create({
          ...(data.nome !== undefined && { nome: schema.string() }),
          ...(data.email !== undefined && { email: schema.string({}, [rules.email()]) }),
          ...(data.tipo !== undefined && {
            tipo: schema.enum(['Cliente', 'Diretor', 'Coordenador', 'Master', 'Professor']),
          }),
        }),
        messages: {
          // eslint-disable-next-line max-len
          'tipo.enum': `Tipo de usuário não informado corretamente. Os tipos são Cliente, Diretor, Coordenador, Master e Professor`,
          'email.email': 'Informe um e-mail válido',
        },
      })

      const usuario = await Usuario.find(params.id)

      if (!usuario) {
        return response.status(401).json({
          mensagem: 'Usuario não encontrado',
        })
      }

      if (data.nome) {
        usuario.nome = data.nome
      }

      if (data.email) {
        const usuarioEmail = await Usuario.findBy('email', data.email)

        if (usuarioEmail) {
          if (usuarioEmail.id !== usuario.id) {
            return response.status(401).json({
              mensagem: 'E-mail já está vinculado a outro usuário',
            })
          }
        }

        usuario.email = data.email
      }

      if (data.tipo) {
        usuario.tipo = data.tipo
      }

      await usuario.save()

      return response.ok({ mensagem: 'Usuário editado com sucesso' })
    } catch (error) {
      if (existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ mensagem: error })
    }
  }

  public async deletarMaster({ request, response, params }: HttpContextContract) {
    try {
      const usuarioLogado: Usuario = request.input('usuario')

      const usuario = await Usuario.find(params.id)

      if (!usuario) {
        return response.status(401).json({
          mensagem: 'Usuário não encontrado',
        })
      }

      if (usuarioLogado.id === usuario.id) {
        return response.status(401).json({
          mensagem: 'Não é possível apagar sua própria conta',
        })
      }

      await usuario.delete()

      return response.status(201).json({ mensagem: 'Usuário deletado com sucesso' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async listagemProfessores({ response }: HttpContextContract) {
    try {
      return await Usuario.query().select(['id', 'nome']).where('tipo', 'Professor')
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async atualizarSenhaMaster({ request, response, params }: HttpContextContract) {
    try {
      const data = await request.validate({
        schema: schema.create({
          senha: schema.string({}, [rules.minLength(6)]),
        }),
        messages: {
          'senha.required': 'Senha não informada',
          'senha.minLength': 'Senha muito pequena. Mínimo de 6 caracteres',
        },
      })

      const usuario = await Usuario.find(params.id)

      if (!usuario) {
        return response.status(401).json({
          mensagem: 'Usuario não encontrado',
        })
      }

      if (data.senha) {
        usuario.senha = data.senha
      }

      await usuario.save()

      return response.ok({ mensagem: 'Senha editada com sucesso' })
    } catch (error) {
      if (existeErroValidacao(error)) {
        const erro = getMensagemErro(error)

        return response.status(401).json(erro)
      }

      return response.badRequest({ mensagem: error })
    }
  }
}
