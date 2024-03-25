import * as jwt from "jsonwebtoken";

export function getPayloadOfToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_RS);
        return decoded;
    } catch (error) {

    }
}