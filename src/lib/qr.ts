import 'server-only'
import QRCode from 'qrcode'

// Encodes a link to the public TC verification page — no PDF or stored image,
// regenerated on demand from the reference number already on the Student record.
export async function generateVerificationQr(reference: string): Promise<string> {
  const url = `${process.env.APP_URL}/verify-tc/${reference}`
  return QRCode.toDataURL(url, { margin: 1, width: 200 })
}
