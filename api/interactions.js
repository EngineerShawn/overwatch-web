// api/interactions.js
import nacl from 'tweetnacl';

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const body = await getRawBody(req);

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(DISCORD_PUBLIC_KEY, 'hex')
  );

  if (!isVerified) {
    return res.status(401).send('Invalid request signature');
  }

  // Handle the interaction
  const interaction = JSON.parse(body);

  if (interaction.type === 1) {
    // PING
    return res.status(200).json({ type: 1 });
  }

  // Handle other interaction types here

  return res.status(200).send('OK');
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}
