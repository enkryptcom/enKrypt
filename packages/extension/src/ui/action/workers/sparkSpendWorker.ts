import {
  buildSparkSpend,
  BuildSparkSpendMessage,
  BuildSparkSpendRequest,
} from '@/libs/spark-handler/build-spark-spend';
import { wasmWorkerInstance } from '@/libs/utils/wasm-worker-loader';

const send = (message: BuildSparkSpendMessage) => postMessage(message);

addEventListener(
  'message',
  async (event: MessageEvent<BuildSparkSpendRequest>) => {
    try {
      const Module = await wasmWorkerInstance.getInstance();
      const result = await buildSparkSpend(Module, event.data, progress =>
        send({ type: 'progress', progress }),
      );
      send({ type: 'result', result });
    } catch (error) {
      console.error('sparkSpendWorker failed:', error);
      send({
        type: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);
