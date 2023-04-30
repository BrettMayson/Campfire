import * as vscode from "vscode";

import { getMode, getSonar, setMode } from "../state";
import { getServer } from "../modes/instructor/server";

export default function start() {
  if (getMode() === "searching") {
    const pin = vscode.workspace
      .getConfiguration("campfire")
      .get<string>("pin");
    if (pin === undefined || pin === "") {
      vscode.window.showErrorMessage("No pin set in settings");
      return;
    }
    getServer();
    getSonar().instructor(pin);
    setMode("instructor");
    vscode.window.showInformationMessage(`Campfire Started: ${pin}`);
  } else {
    vscode.window.showInformationMessage(`Already in ${getMode()} mode`);
  }
}
