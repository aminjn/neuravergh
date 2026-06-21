import dotenv from 'dotenv';
dotenv.config();
import './proxy.js'; // پیکربندی پروکسی برای fetch خروجی (بعد از بارگذاری env)
import { createApp } from './app.js';

const PORT = Number(process.env.PORT || 4000);
const app = createApp();

app.listen(PORT, () => {
  console.log(`Neura API listening on http://127.0.0.1:${PORT}`);
});
