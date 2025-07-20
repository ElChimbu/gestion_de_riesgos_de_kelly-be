import express from 'express';
import multer from 'multer';
import SftpClient from 'ssh2-sftp-client';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configura multer para usar memoria en lugar de disco (compatible con Vercel)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ningún archivo.' });
  }

  // Configuración SFTP desde variables de entorno
  const sftp = new SftpClient();
  const sftpConfig = {
    host: process.env.SFTP_HOST,
    port: process.env.SFTP_PORT ? parseInt(process.env.SFTP_PORT) : 22,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASS
  };

  // Nombre final del archivo (puedes personalizarlo)
  const remoteFileName = Date.now() + path.extname(req.file.originalname);
  const remotePath = `/uploads/${remoteFileName}`;

  try {
    // Conectar y subir el archivo desde el buffer en memoria
    await sftp.connect(sftpConfig);
    await sftp.put(req.file.buffer, remotePath);
    await sftp.end();

    // Devuelve la URL pública
    res.json({ url: `${process.env.SFTP_PUBLIC_URL}/uploads/${remoteFileName}` });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir la imagen', details: err.message });
  }
});

export default router; 