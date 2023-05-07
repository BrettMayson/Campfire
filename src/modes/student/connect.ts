import * as vscode from "vscode";
import * as dgram from "dgram";

import { setInstructorFiles, setMode } from "../../state";
import WebSocket = require("ws");
import { FromServer, ToServer } from "../../model/message";

export class LocalStudent {
  active: boolean = false;
  ws: WebSocket;

  pendingReads: { [key: string]: (data: unknown) => void } = {};

  constructor(remote: dgram.RemoteInfo) {
    this.ws = new WebSocket(`ws://${remote.address}:14353`);
    this.ws.on("error", console.error);
    this.ws.on("close", () => {
      vscode.window.showInformationMessage("Disconnected from the Campfire");
      setMode("searching");
    });
    this.ws.on("message", (data) => {
    let message: FromServer = JSON.parse(data.toString());
    switch (message.type) {
      case "ident":
        let name = vscode.workspace
          .getConfiguration("campfire")
          .get<string>("name");
        if (name === undefined || name === "") {
          vscode.window
            .showInputBox({ prompt: "Campfire - Enter your name" })
            .then((name) => {
              if (name !== undefined) {
                vscode.workspace
                  .getConfiguration("campfire")
                  .update("name", name, vscode.ConfigurationTarget.Global);
                this.send({ type: "ident", name });
              } else {
                vscode.window.showErrorMessage(
                  "A name is required to connect to the Campfire"
                );
                this.ws.close();
                setMode("searching");
              }
            });
        } else {
          this.send({ type: "ident", name });
        }
        break;
      case "connect":
        vscode.window.showInformationMessage("Connected to the Campfire");
        this.send({ type: "files" });
        break;
      case "files":
        vscode.window.showInformationMessage("Received files");
        setInstructorFiles(message.files);
        break;
      case "fileContent":
        let key = message.key;
        let data = message.data;
        if (this.pendingReads[key] !== undefined) {
          this.pendingReads[key](data);
          delete this.pendingReads[key];
        }
        break;
      }
    });
  }

  send(msg: ToServer) {
    this.ws.send(JSON.stringify(msg));
  }

  _key() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  fileContents(path: string): Promise<string> {
    const key = this._key();
    this.send({ key, type: "fileContent", fileName: path });
    return new Promise((resolve, reject) => {
      this.pendingReads[key] = (data) => {
        resolve(data as string);
      };
    });
  }
}
