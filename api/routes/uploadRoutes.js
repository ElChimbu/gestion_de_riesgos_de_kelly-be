import express from 'express';
import multer from 'multer';
import SftpClient from 'ssh2-sftp-client';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configura multer para guardar el archivo temporalmente en disco
const upload = multer({ dest: 'uploads_tmp/' });

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
    // Conectar y subir el archivo
    await sftp.connect(sftpConfig);
    await sftp.put(req.file.path, remotePath);
    await sftp.end();

    // Elimina el archivo temporal
    fs.unlinkSync(req.file.path);

    // Devuelve la URL pública
    res.json({ url: `${process.env.SFTP_PUBLIC_URL}/uploads/${remoteFileName}` });
  } catch (err) {
    // Limpieza en caso de error
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error al subir la imagen', details: err.message });
  }
});

export default router; 