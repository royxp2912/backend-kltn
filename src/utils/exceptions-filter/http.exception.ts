import { ArgumentsHost, Catch, HttpException, HttpStatus } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from 'express';
import { MyResponseExceptionObj } from "src/constants/api.type";

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const myResponse: MyResponseExceptionObj = {
            success: false,
            status: 500,
            message: "Internal Server Error",
        }

        if (exception instanceof HttpException) {
            myResponse.success = false;
            myResponse.status = exception.getStatus();
            myResponse.message = exception.getResponse();
        }

        response.status(myResponse.status).json(myResponse);
        super.catch(exception, host);
    }
}