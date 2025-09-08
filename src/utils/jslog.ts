import axios from "axios";

/**
 * Sends logs to CloudWatch via your API Gateway endpoint.
 *
 * @param type - The log type (e.g. "INFO", "ERROR", "DEBUG")
 * @param title - A short title describing the log
 * @param detail - Any details (string, object, or error)
 */
export async function JSLogs(type: string, title: string, detail: any): Promise<void> {
  try {
    const payload = {
      type,
      title,
      detail: typeof detail === "object" ? JSON.stringify(detail) : detail,
      timestamp: new Date().toISOString()
    };

    await axios.post(
      "https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/JSLogs",
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // Optionally log locally in dev
    if (import.meta.env.DEV) {
      console.log("JSLogs sent:", payload);
    }
  } catch (err) {
    console.error("Failed to send JSLogs:", err);
  }
}
