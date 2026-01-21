// src/server.ts
import { app } from "./app";
import { env } from "./config/env";
import { pool } from "./config/db";
import { startChargeSchedulerLoop } from "./jobs/chargeScheduler";

let server: ReturnType<typeof app.listen> | null = null;

async function bootstrap() {
  try {
    // Testa conexão com o banco
    await pool.query("SELECT 1");
    console.log("[db] connected");

    // Inicia scheduler (MVP: no mesmo processo)
    startChargeSchedulerLoop();
    console.log("[scheduler] started");

    server = app.listen(env.PORT, () => {
      console.log(`[api] running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error("[bootstrap] failed to start:", err);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`[shutdown] signal received: ${signal}`);

  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server!.close(() => resolve());
      });
      console.log("[shutdown] http server closed");
    }

    await pool.end();
    console.log("[shutdown] db pool closed");

    process.exit(0);
  } catch (err) {
    console.error("[shutdown] error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Inicia aplicação
bootstrap();
