import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
  log(message: string, context?: string) {
    const entry = `${context}\t${message}`;
    super.log(entry);
  }
  error(message: string, stackOrContext?: string) {
    const entry = `${stackOrContext}\t${message}`;
    super.error(entry);
  }
}
