/**
 * Request signing for Alfa API operational (money-moving) methods.
 *
 * The production Alfa API requires every operational request — most importantly
 * payment-registry submission — to carry an `X-Alfabank-Signature` header. That
 * value is a PKCS#7 (CAdES-BES) detached signature over the request body,
 * produced with a GOST R 34.10-2012 key (RSA certificates are also supported in
 * some flows), typically via a CryptoPro CSP installation.
 *
 * Implementing real signing is out of scope for this package: it needs a real
 * certificate, a crypto provider, and a signed bank contract. So the default
 * {@link UnimplementedSigner} throws a clear, actionable error instead of
 * pretending to sign. Inject your own {@link Signer} to enable payment
 * submission against the real API.
 *
 * Docs: https://developers.alfabank.ru/products/alfa-api/documentation
 */
export interface Signer {
  /** Returns the value for the `X-Alfabank-Signature` header for `payload`. */
  sign(payload: string): Promise<string> | string;
}

/** Default signer: refuses to sign and explains exactly what is required. */
export class UnimplementedSigner implements Signer {
  sign(): never {
    throw new Error(
      "GOST request signing is not implemented in this package. Operational " +
        "Alfa API methods (payment-registry submission) require a PKCS#7 " +
        "(CAdES-BES) GOST-2012 signature in the X-Alfabank-Signature header, " +
        "produced with a real certificate via CryptoPro CSP. Inject a custom " +
        "Signer to enable payment submission. " +
        "See https://developers.alfabank.ru/products/alfa-api/documentation",
    );
  }
}
