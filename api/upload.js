import multer from 'multer';
import SftpClient from 'ssh2-sftp-client';
import path from 'path';
import fs from 'fs';

const upload = multer({ dest: '/tmp/uploads_tmp/' });

export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  await runMiddleware(req, res, upload.single('file'));

  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ningún archivo.' });
  }

  const sftp = new SftpClient();
  const sftpConfig = {
    host: process.env.SFTP_HOST,
    port: process.env.SFTP_PORT ? parseInt(process.env.SFTP_PORT) : 22,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASS,
  };

  const remoteFileName = Date.now() + path.extname(req.file.originalname);
  const remotePath = `/uploads/${remoteFileName}`;

  try {
    await sftp.connect(sftpConfig);
    await sftp.put(req.file.path, remotePath);
    await sftp.end();

    fs.unlinkSync(req.file.path);

    res.json({ url: `${process.env.SFTP_PUBLIC_URL}/uploads/${remoteFileName}` });
  } catch (err) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error al subir la imagen', details: err.message });
  }
}