import { defineConfig } from "tsup";
import { config } from "dotenv";

const env = {};
config({ processEnv: env });

// TODO: Remove after confirmation and testing
console.log("REQUEST PACKAGE ENV VARS", env);
export default defineConfig({
  env,
});
