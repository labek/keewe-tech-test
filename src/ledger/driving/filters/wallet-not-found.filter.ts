import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { WalletNotFoundException } from '../../domain/errors/wallet-not-found-exception.error.js';

@Catch(WalletNotFoundException)
export class WalletNotFoundFilter implements ExceptionFilter {
	catch(error: WalletNotFoundException, host: ArgumentsHost): void {
		host.switchToHttp().getResponse<Response>().status(HttpStatus.NOT_FOUND).json({
			statusCode: HttpStatus.NOT_FOUND,
			error: 'Not Found',
			message: error.message,
		});
	}
}
