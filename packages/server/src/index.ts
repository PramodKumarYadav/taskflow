import 'dotenv-vault/config';
import { createApp, connectDB } from './app';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[server] TaskFlow API running on http://localhost:${PORT}`);
    console.log(`[server] Environment: ${process.env.NODE_ENV ?? 'local'}`);
  });
}

main().catch((err) => {
  console.error('[server] Fatal error:', err);
  process.exit(1);
});
