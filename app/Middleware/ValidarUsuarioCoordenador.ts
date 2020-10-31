import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ValidarUsuarioCoordenador {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    const usuario = ctx.request.input('usuario')

    if(usuario.tipo === 'Coordenador') {
      await next()
    } else {
      return ctx.response.forbidden({
        mensagem: 'Você não tem permissão pra realizar essa ação',
      })
    }
  }
}
