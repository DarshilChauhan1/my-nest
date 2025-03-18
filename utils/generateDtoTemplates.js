export const VALID_FILE_NAME_REGEX = /^[a-zA-Z](?:[a-zA-Z0-9]*[-]?[a-zA-Z0-9]+)*$/;

export const toPascalCase = (str) => {
    return str
        .split(/[-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
};

export const getDecorators = (name, type, useSwagger, askOptionalOrRequired) => {
    const decorators = {
        string: `@IsString()`,
        number: `@IsNumber()`,
        boolean: `@IsBoolean()`,
        date: `@IsDate()`,
        default: `@IsString()`
    };

    const apiProperty = useSwagger ? `@ApiProperty({
    description: '${name} field',
    example: ${type === 'string' ? "'example string'" : type === 'number' ? "0" : "false"}
})\n    ` : '';

    if(askOptionalOrRequired == 'Optional') {
        const addOptional = `@IsOptional()\n    `;
        return apiProperty + addOptional + decorators[type] || decorators.default;
    }

    if(askOptionalOrRequired == 'Required') {
        const addRequired = `@IsNotEmpty()\n    `;
        return apiProperty + addRequired + decorators[type] || decorators.default;
    }


};

export const generateDtoTemplate = (className, properties) => {
    return `import { 
    IsString, 
    IsNumber, 
    IsBoolean, 
    IsDate, 
    IsOptional,
    IsNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ${className}Dto {
${properties}
}`;
};
