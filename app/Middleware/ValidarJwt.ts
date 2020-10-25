import jwt from 'jsonwebtoken'
import config from '@ioc:Adonis/Core/Config'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NaoAutorizadoException from 'App/Exceptions/NaoAutorizadoException'

import Usuario from 'App/Models/Usuario'

export default class ValidarJwt {
  public async handle ({request, auth}: HttpContextContract | any, next: () => Promise<void>) {
    const {authorization} = request.headers()

    if (!authorization) {
      throw new NaoAutorizadoException('Missing JWT Token')
    }

    const [, token] = authorization.split(' ')

    const secret = config.get('jwt').appKey as string

    try {
      const payload: any = jwt.verify(token, secret)
      const user = await Usuario.findByOrFail('uuid', payload.sub)

      const apit = await auth.login(user)
      console.log(apit)
    } catch {
      throw new NaoAutorizadoException('Invalid JWT Token')
    }

    await next()
  }
}
