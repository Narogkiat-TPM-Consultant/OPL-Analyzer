
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "oee_digital_platform-frontend",
  });
}
