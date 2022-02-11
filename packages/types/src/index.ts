// eslint-disable-next-line no-shadow
enum SigningErrors {
    UnableToVerify = "Signing verification failed",
    NotSupported = "Sign type not supported"
}
interface SignerInterface {
    sign: (msgHash: string, privateKey: string) => Promise<string>;
}
const Errors = {
    SigningErrors
}

export {
    Errors,
    SignerInterface
}