import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next
            .handle()
            .pipe(
                map((data) => ({
                    success: true,
                    status: context.switchToHttp().getResponse().statusCode,
                    message: data.message,
                    pages: data.pages,
                    total: data.total,
                    data: data.result,
                }))
            )
    }
}