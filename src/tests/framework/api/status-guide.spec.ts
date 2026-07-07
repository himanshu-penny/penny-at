import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { test, expect } from "@fixtures";

type ExampleResponse = {
  id?: string;
  status?: string;
  message: string;
};

let server: Server | undefined;
let baseUrl = "";

test.describe(
  "TC_API_FRAMEWORK_STATUS — Generic API status guide examples",
  { tag: ["@smoke", "@api"] },
  () => {
    test.beforeAll(async () => {
      server = createServer(handleExampleApiRequest);

      await new Promise<void>((resolve, reject) => {
        const activeServer = server!;
        const onError = (error: Error): void => {
          activeServer.off("listening", onListening);
          reject(error);
        };
        const onListening = (): void => {
          activeServer.off("error", onError);
          resolve();
        };

        activeServer.once("error", onError);
        activeServer.listen(0, "127.0.0.1", onListening);
      });

      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Example API server did not start with a local port.");
      }

      baseUrl = `http://127.0.0.1:${address.port}`;
    });

    test.afterAll(async () => {
      const activeServer = server;
      if (!activeServer?.listening) return;

      await new Promise<void>((resolve, reject) => {
        activeServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    });

    test("TC_API_FRAMEWORK_STATUS_001 — a successful lookup explains the success status", async ({
      requestHandler,
    }) => {
      const response = await requestHandler
        .url(baseUrl)
        .path("/api/examples/orders/active")
        .get<ExampleResponse>(200);

      expect(response.status).toBe("READY");
      expect(response.message).toBe("The example order is ready for review.");
    });

    test("TC_API_FRAMEWORK_STATUS_002 — a missing record explains the rejection status", async ({
      requestHandler,
    }) => {
      const response = await requestHandler
        .url(baseUrl)
        .path("/api/examples/orders/missing")
        .get<ExampleResponse>(404);

      expect(response.message).toBe("The example order was not found.");
    });
  },
);

function handleExampleApiRequest(request: IncomingMessage, response: ServerResponse): void {
  if (request.method === "GET" && request.url === "/api/examples/orders/active") {
    sendJson(response, 200, {
      id: "ORD-1001",
      status: "READY",
      message: "The example order is ready for review.",
    });
    return;
  }

  if (request.method === "GET" && request.url === "/api/examples/orders/missing") {
    sendJson(response, 404, {
      message: "The example order was not found.",
    });
    return;
  }

  sendJson(response, 404, {
    message: "The example endpoint was not found.",
  });
}

function sendJson(response: ServerResponse, statusCode: number, body: ExampleResponse): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(body));
}
