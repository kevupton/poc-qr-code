import {QrCode} from "./qr-code";
import {v1, v4} from 'uuid';

describe('QRCode', () => {

    let secret: string;
    let id: string;
    let qrCode: QrCode;

    beforeEach(async () => {
        secret = v1();
        id = v4();

        qrCode = new QrCode(id, secret);
    });

    it('should be able to instantiate', async () => {
        expect(qrCode).toBeDefined();
    });

    it('should be able to create a body', async () => {
        expect(typeof qrCode.body()).toBe('string');
        expect(qrCode.body()).toMatch(qrCode.payload() + ',' + qrCode.sign());
    });

    it('should create a qr-code', async () => {
        console.log('QRCODE: \'' + qrCode.body() + '\'');
        qrCode.generate();
    });

    it('should be able to encrypt and decrypt the body', async () => {
        const original = 'test';

        const result = qrCode.encrypt(original);
        const decode = qrCode.decrypt(result);

        expect(decode).toBe(qrCode.payload());
    });
});
