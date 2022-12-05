import express from 'express';
import history from 'connect-history-api-fallback';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

history({
  index: './dist/index.html',
});

//Application-level middleware
app.use('/public', express.static('./public'));
app.use('/src', express.static('./src'));
app.use(express.static('./dist'));

app.get('/', (req, res) => {
  res.sendFile('./dist/index.html');
});

app.use((req, res) => {
  return res.status(404).json({
    description: 'Page not found',
  });
});

//слушаем порт
const port = process.env.PORT;

const start = () => {
  app.listen(port, () => {
    console.log(`Connection opened on port ${port}`);
  });
};

start();

export default app;
