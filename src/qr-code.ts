import qrcode from 'qrcode-terminal';
import {
    createHmac,
    createSign,
    generateKeyPairSync,
    HexBase64Latin1Encoding,
    privateDecrypt, privateEncrypt,
    publicDecrypt, publicEncrypt
} from "crypto";

export class QrCode {

    public static readonly VERSION = 1;
    public static readonly OUTPUT : HexBase64Latin1Encoding = 'base64';

    public readonly publicKey: string;
    public readonly privateKey: string;

    constructor(
        public readonly id: string,
        public readonly secret: string,
        public readonly method: 'rsa' | 'hmac' = 'rsa',
        private readonly passphrase = '',
    ) {
        const {publicKey, privateKey} = generateKeyPairSync('rsa', {
            modulusLength: 512,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase,
            }
        });


        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    minutes() {
        return Math.round(Date.now() / (60 * 1000));
    }

    payload() {
        return `${QrCode.VERSION},${this.minutes()},${this.id}`;
    }

    sign(priv = true) {
        if (this.method === 'rsa') {
            const sign = createSign('sha256');
            sign.update(this.payload());
            sign.end();
            return sign.sign(priv ? { key: this.privateKey, passphrase: this.passphrase } : this.publicKey, QrCode.OUTPUT);
        }
        else {
            const hmac = createHmac('sha256', this.secret);
            hmac.update(this.payload());
            return hmac.digest(QrCode.OUTPUT);
        }
    }

    encrypt(content: string, priv = true) {
        const buffer = Buffer.from(content);
        const result = priv ? privateEncrypt({ key: this.privateKey, passphrase: this.passphrase }, buffer) : publicEncrypt(this.publicKey, buffer);
        return result.toString(QrCode.OUTPUT);
    }

    decrypt(content: string, priv = true) {
        const buffer = Buffer.from(content, QrCode.OUTPUT);
        const result = priv ? publicDecrypt(this.publicKey, buffer) : privateDecrypt(this.privateKey, buffer);
        return result.toString();
    }

    body() {
        return `${this.payload()},${this.sign()}`
    }

    generate() {
        qrcode.generate(this.body());
    }
}
