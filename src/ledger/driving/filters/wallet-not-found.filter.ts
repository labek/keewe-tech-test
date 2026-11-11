import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { WalletNotFoundError } from '../../domain/errors/wallet-not-found.error.js';

@Catch(WalletNotFoundError)
export class WalletNotFoundFilter implements ExceptionFilter {
	catch(error: WalletNotFoundError, host: ArgumentsHost): void {
		host
			.switchToHttp()
			.getResponse<Response>()
			.status(HttpStatus.NOT_FOUND)
			.json({ statusCode: HttpStatus.NOT_FOUND, error: 'Not Found', message: error.message });
	}
}
