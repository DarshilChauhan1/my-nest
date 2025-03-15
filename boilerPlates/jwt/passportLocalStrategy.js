export const passPortLocalStrategyBoilerPlate = `import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({ usernameField: 'email' }); // Use 'email' instead of 'username'
  }

  async validate(email: string, password: string): Promise<any> {
    // Add your authentication logic here, e.g., call a service to validate user credentials.
    // const user = await authService.validateUser(email, password);

    const user = null; // Replace this with actual validation logic

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user; // Return authenticated user object
  }
}
`