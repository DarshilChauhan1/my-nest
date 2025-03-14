export const responseHandlerBoilerPlate = `export class ResponseHandler {
    message: string;
    statusCode: number;
    data: any;
    success : boolean;

    constructor(message: string, statusCode: number, success: boolean, data ?: any) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.success = success;
    }
}
`;