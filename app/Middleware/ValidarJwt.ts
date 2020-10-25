import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NaoAutorizadoException from 'App/Exceptions/NaoAutorizadoException'

import Usuario from 'App/Models/Usuario'

const SECRET = Env.get('JWT_SECRET', '@') as string

export default class ValidarJwt {
  public async handle ({request}: HttpContextContract, next: () => Promise<void>) {
    const {authorization} = request.headers()

    if (!authorization) {
      throw new NaoAutorizadoException('Token não informado')
    }

    const [, token] = authorization.split(' ')

    const secret = SECRET

    try {
      const payload: any = jwt.verify(token, secret)
      const usuario = await Usuario.findByOrFail('id', payload.usuario)

      request.updateBody({ ...{ usuario }, ...request.all() })
    } catch {
      throw new NaoAutorizadoException('Token inválido')
    }

    await next()
  }
}
