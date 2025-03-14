export const responseInterceptorBoilerPlate = `import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs";
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const response = context.switchToHttp().getResponse();

        // just intercept the status code and data
        return next.handle().pipe(map((data) => {
            // set the response status according to the status code from response body
            response.status(data.statusCode ?? 200)
            return data
        }))
    }
}`;