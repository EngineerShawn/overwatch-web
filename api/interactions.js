import { buffer } from 'micro';
import nacl from 'tweetnacl';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
console.log('DISCORD_PUBLIC_KEY:', DISCORD_PUBLIC_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const rawBody = (await buffer(req)).toString('utf-8');

    // 🚨 Fallback if required values are missing
    if (!signature || !timestamp || !DISCORD_PUBLIC_KEY || !rawBody) {
      console.error('❌ Missing values:', {
        signature,
        timestamp,
        publicKeyExists: !!DISCORD_PUBLIC_KEY,
        rawBodyExists: !!rawBody,
      });
      return res.status(400).send('Missing headers or body');
    }

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, 'hex'),
      Buffer.from(DISCORD_PUBLIC_KEY, 'hex')
    );

    if (!isVerified) {
      console.warn('❌ Signature verification failed');
      return res.status(401).send('Bad request signature');
    }

    const json = JSON.parse(rawBody);

    if (json.type === 1) {
      return res.status(200).json({ type: 1 }); // PING
    }

    return res.status(200).json({ type: 5 }); // ACK for other interactions
  } catch (err) {
    console.error('🔥 ERROR in /api/interactions:', err);
    return res.status(500).send('Internal server error');
  }
}