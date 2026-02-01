
// Deprecated: Use individual files in api/ folder for better Vercel stability
export default function handler(req, res) {
  res.status(200).json({ status: 'server is running with native handlers' });
}
