import * as vscode from "vscode";
import * as dgram from "dgram";

import { setInstructorFiles, setMode } from "../../state";
import WebSocket = require("ws");

export default function student(remote: dgram.RemoteInfo) {
  setMode("student");
  const ws = new WebSocket(`ws://${remote.address}:14353`);
  ws.on("error", console.error);
  ws.on("close", () => {
    vscode.window.showInformationMessage("Disconnected from the Campfire");
    setMode("searching");
  });
  ws.on("message", (data) => {
    let message = JSON.parse(data.toString());
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
                ws.send(JSON.stringify({ type: "ident", name }));
              } else {
                vscode.window.showErrorMessage(
                  "A name is required to connect to the Campfire"
                );
                ws.close();
                setMode("searching");
              }
            });
        } else {
          ws.send(JSON.stringify({ type: "ident", name }));
        }
        break;
      case "connect":
        vscode.window.showInformationMessage("Connected to the Campfire");
        ws.send(JSON.stringify({ type: "files" }));
        break;
      case "files":
        vscode.window.showInformationMessage("Received files");
        setInstructorFiles(message.files);
        break;
    }
  });
}
