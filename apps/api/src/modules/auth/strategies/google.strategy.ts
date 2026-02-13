import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor(private readonly config: ConfigService) {
        super({
            clientID: config.get<string>("google.clientId"),
            clientSecret: config.get<string>("google.clientSecret"),
            callbackURL: config.get<string>("google.callbackUrl"),
            scope: ["email", "profile"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback
    ): Promise<any> {
        const { name, emails, id } = profile;
        const user = {
            googleId: id,
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            accessToken,
        };
        done(null, user);
    }
}
