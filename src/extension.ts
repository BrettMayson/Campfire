// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as dgram from "dgram";
import { WebSocket, WebSocketServer } from "ws";

import { InstructorFilesProvider } from "./views/explorer/instructorFiles";
import { Sonar } from "./sonar";

import { getMode, setMode } from "./state";

export function activate(context: vscode.ExtensionContext) {
  setup(context);

  const sonar = new Sonar();

  sonar.on("found", (remote: dgram.RemoteInfo) => {
    console.log("found");
    console.log(remote);
    setMode("student");
    const ws = new WebSocket(`ws://${remote.address}:14353`);
    ws.on("error", console.error);
    ws.on("close", () => {
      console.log("disconnected");
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
                  console.log(`sent ident ${name}`);
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
          console.log("connected");
          vscode.window.showInformationMessage("Connected to the Campfire");
          break;
      }
    });
  });

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("campfire.instruct", () => {
    if (getMode() === "searching") {
      const pin = vscode.workspace
        .getConfiguration("campfire")
        .get<string>("pin");
      if (pin === undefined || pin === "") {
        vscode.window.showErrorMessage("No pin set in settings");
        return;
      }
      context.globalState.update("mode", "instructor");
      const wss = new WebSocketServer({ port: 14353 });
      wss.on("connection", (ws) => {
        let name = "Unknown";

        ws.on("error", console.error);

        ws.on("message", (data) => {
          let message = JSON.parse(data.toString());
          switch (message.type) {
            case "ident":
              name = message.name;
              vscode.window.showInformationMessage(
                `Student ${message.name} connected`
              );
              ws.send(JSON.stringify({ type: "connect" }));
              break;
            case "connect":
          }
        });

        ws.on("close", () => {
          vscode.window.showInformationMessage(`Student ${name} disconnected`);
        });

        ws.send(JSON.stringify({ type: "ident" }));
      });
      sonar.instructor(pin);
      vscode.window.showInformationMessage(`Campfire Started: ${pin}`);
    } else {
      vscode.window.showInformationMessage(`Already in ${getMode()} mode`);
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function setup(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider(
    "instructorFiles",
    new InstructorFilesProvider()
  );
}
