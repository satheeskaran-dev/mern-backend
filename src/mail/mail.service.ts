import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to,
        from: 'satheeshmailer@gmail.com',
        subject,
        template,
        context,
      });

      return true;
    } catch (err) {
      return false;
    }
  }
}
