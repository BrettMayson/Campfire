import * as vscode from "vscode";
import { Sonar } from "./sonar";

// Mode
var mode: "searching" | "student" | "instructor" = "searching";
export function setMode(newMode: "searching" | "student" | "instructor") {
  mode = newMode;
  vscode.commands.executeCommand("setContext", "campfire.mode", newMode);
  switch (newMode) {
    case "searching":
      hideStatus();
      break;
    case "student":
      setStatus("$(flame) Connected");
      break;
    case "instructor":
      const pin = vscode.workspace
        .getConfiguration("campfire")
        .get<string>("pin");
      setStatus(`$(flame) ${pin}`);
      break;
  }
}
export function getMode() {
  return mode;
}

// Sonar
var sonar: Sonar | undefined = undefined;
export function getSonar() {
  if (sonar === undefined) {
    sonar = new Sonar();
  }
  return sonar;
}

// Status
var status = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  100
);
export function setStatus(text: string) {
  status.text = text;
  status.show();
}
export function hideStatus() {
  status.hide();
}
export function getStatus() {
  return status;
}
setMode("searching");
