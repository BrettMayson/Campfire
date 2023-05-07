import * as vscode from "vscode";
import { WebSocketServer } from "ws";
import { readDirectory } from "../../utils/readDirectory";
import { FromServer, ToServer } from "../../model/message";

export class RemoteStudent {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class Server {
  _wss: WebSocketServer = new WebSocketServer({ port: 14353 });
  _students: { [key: string]: RemoteStudent } = {};

  constructor() {
    this._wss.on("connection", (ws, req) => {
      let name = "Unknown";
      let remote = `${req.socket.remoteAddress}:${req.socket.remotePort}`;

      ws.on("error", console.error);

      function send(msg: FromServer) {
        ws.send(JSON.stringify(msg));
      }
      
      ws.on("message", async (data) => {
        let message: ToServer = JSON.parse(data.toString());
        switch (message.type) {
          case "ident":
            name = message.name;
            vscode.window.showInformationMessage(
              `Student ${message.name} connected`
            );
            this._students[remote] = new RemoteStudent(message.name);
            send({ type: "connect" });
            break;
          case "files":
            let files = await readDirectory(vscode.workspace.workspaceFolders![0].uri);
            console.log({ files });
            send({ type: "files", files });
            break;
          case "fileContent": 
            const filePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, message.fileName);
            let fileContent = await vscode.workspace.fs.readFile(filePath);
            send({ key: message.key, type: "fileContent", data: fileContent.toString() });
            break;
        }
      });

      ws.on("close", () => {
        vscode.window.showInformationMessage(`Student ${name} disconnected`);
        delete this._students[remote];
      });

      ws.send(JSON.stringify({ type: "ident" }));
    });
  }

  broadcast(message: any) {
    this._wss.clients.forEach((client) => {
      client.send(message);
    });
  }

  dispose() {
    this._wss.close();
  }

  students() {
    return Object.values(this._students);
  }
}

var server: Server | undefined = undefined;
export function getServer() {
  if (server === undefined) {
    server = new Server();
  }
  return server;
}
