import * as bcrypt from 'bcrypt';

export async function encode(rawPassword: string) {
    const SALT = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(rawPassword, SALT);
}

export async function compare(rawPassword: string, password: string) {
    return bcrypt.compareSync(rawPassword, password);
}