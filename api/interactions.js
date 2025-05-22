// api/interactions.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    return res.status(200).json({ type: 1 }); // simple PING/PONG response
  } else {
    return res.status(405).send('Method Not Allowed');
  }
}
