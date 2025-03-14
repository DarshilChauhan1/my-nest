export const globalCatchBoilerPlate = `import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, response, Response } from 'express'
import { ResponseHandler } from '../utils/response-handler.utils';

@Catch()
export class GlobalCatchHandler implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void {
        try {
            const ctx = host.switchToHttp()
            const response = ctx.getResponse<Response>();
            const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : ""
    
            const httpStatus = exception instanceof HttpException ? exception.getStatus() : exception['statusCode'] || HttpStatus.INTERNAL_SERVER_ERROR;
            let responseBody = {
                statusCode: httpStatus,
                message: exceptionResponse['message'] ? exceptionResponse['message'] : exception.message || "Something went wrong",
                success: (httpStatus == HttpStatus.OK || httpStatus == HttpStatus.CREATED) ? true : false
            }
    
            //For custom error if we provide redirectTo
            if (exceptionResponse['redirectTo'] != "") responseBody['redirectTo'] = exceptionResponse['redirectTo']
            //sending the error response 
            response.status(httpStatus).send(responseBody);
        } catch (error) {
            console.log(error)
            const errorResponse = new ResponseHandler('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR, false)
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorResponse);
        }
    }

}
`