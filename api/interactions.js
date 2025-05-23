// api/interactions.js
import { buffer } from 'micro';
import nacl from 'tweetnacl';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

export const config = {
    api: {
        bodyParser: false, // Disable default body parsing
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    try {
    // Verify the request signature
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const rawBody = (await buffer(req)).toString('utf8');
    

    const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + rawBody),
        Buffer.from(signature, 'hex'),
        Buffer.from(DISCORD_PUBLIC_KEY, 'hex')
    );

  if (!isVerified) {
    return res.status(401).send('Bad request signature');
  }


  const json = JSON.parse(rawBody)

    if (json.type === 1) {
        // Respond to a ping
        return res.status(200).json({ type: 1 });
    }
    return res.status(200).json({ type: 5 }); //ACK other interaction types
} catch (err) {
    console.error('🔥 ERROR in /api/interactions:', err);
    return res.status(500).send('Internal server error');
    }
}

// async function getRawBody(req) {
//   return new Promise((resolve, reject) => {
//     let data = '';
//     req.setEncoding('utf8');
//     req.on('data', (chunk) => {
//       data += chunk;
//     });
//     req.on('end', () => {
//       resolve(data);
//     });
//     req.on('error', (err) => {
//       reject(err);
//     });
//   });
// }
