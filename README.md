# MyNest CLI

A custom CLI tool to streamline NestJS project setup and development, providing essential commands for project creation, Swagger documentation generation, authentication setup, and DTO creation.

## Installation

You can install the CLI globally using npm:

```sh
npm install -g my-nest
```

Or use it locally in a project:

```sh
npm install my-nest
```

## Commands

### 1. Create a New Project

Generate a new NestJS project with a predefined structure.

```sh
my-nest create <projectName>
```

**Example:**

```sh
my-nest create my-awesome-app
```

This will create a new NestJS project named `my-awesome-app` with a structured setup.

---

### 2. Generate Swagger Documentation

Automatically generate OpenAPI documentation using Swagger.

```sh
my-nest swagger
```

**Example:**

```sh
my-nest swagger
```

This will generate Swagger documentation based on the defined API decorators.

---

### 3. Setup Authentication

Quickly scaffold authentication using JWT-based authentication.

```sh
my-nest auth
```

**Example:**

```sh
my-nest auth
```

This command will generate authentication-related files and set up JWT authentication in your NestJS project.

---

### 4. Generate a DTO (Data Transfer Object)

Create a DTO file with validation decorators by answering a set of interactive questions.

```sh
my-nest generate-dto <moduleName>
```

**Example:**

```sh
my-nest generate-dto auth
```

#### Interactive Steps:

1. **Select the module for which you want to create the DTO** (e.g., `auth`)
2. **Enter the entity file name** (e.g., `auth`)
3. **Enter the save file name** (e.g., `create`)
4. **Do you want to add Swagger properties?** (`Yes` / `No`)
5. **Do you want all fields optional or required?** (`Optional` / `Required`)

#### Example Output:

If you run:

```sh
my-nest generate-dto auth
```

and provide the following inputs:

- Entity file name: `auth`
- Save file name: `create`
- Swagger properties: `Yes`
- All fields: `Required`


You might get a generated DTO file like this:

```ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
    @ApiProperty({ description: 'User email', example: 'user@example.com' })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({ description: 'User password', example: 'securePassword123' })
    @IsNotEmpty()
    @IsString()
    password: string;
}
```

This ensures the DTO follows NestJS best practices and includes necessary validation and Swagger properties.

## Contributing

Feel free to open issues or submit pull requests if you find any bugs or want to contribute enhancements.

