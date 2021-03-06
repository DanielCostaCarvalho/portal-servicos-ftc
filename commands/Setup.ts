import { BaseCommand } from '@adonisjs/core/build/standalone'
import { exec } from 'child_process'

export default class Setup extends BaseCommand {
  /**
   * Command Name is used to run the command
   */
  public static commandName = 'setup'

  /**
   * Command Name is displayed in the "help" output
   */
  public static description = ''

  private asyncExec(cmd): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }
        resolve(stdout ? stdout : stderr)
      })
    })
  }

  public async run() {
    const so = await this.prompt.choice('Qual seu SO?', [
      'Distro Linux',
      'Windows',
      'Só me tira daqui',
    ])
    if (so !== 'Só me tira daqui') {
      if (so === 'Distro Linux') {
        await this.asyncExec('cp .env.example .env')
        this.logger.log('.env criado')
      } else {
        await this.asyncExec('copy .env.example .env')
        this.logger.log('.env criado')
      }

      const buildMessage = await this.asyncExec('npm run build')
      this.logger.log(buildMessage)
      try {
        await this.asyncExec('mkdir tmp')
      } catch (err) {
        this.logger.warning(err)
      }
      const migrationsMessage = await this.asyncExec('node ace migration:run')
      this.logger.log(migrationsMessage)
      const seedmessage = await this.asyncExec('node ace db:seed')
      this.logger.log(seedmessage)

      this.logger.success("Aeeeeee!!! Agora é rodar 'npm run start' e sucesso!")
    }
  }
}
