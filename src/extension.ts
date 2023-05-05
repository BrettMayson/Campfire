import * as vscode from "vscode";

import { InstructorFilesProvider } from "./views/explorer/instructorFiles";

import { getSonar, getStatus } from "./state";
import start from "./commands/start";
import student from "./modes/student/connect";
import { startEvents } from "./modes/instructor/events";

export function activate(context: vscode.ExtensionContext) {
  setup(context);
  startEvents(context);

  let valid = (vscode.workspace.workspaceFolders || []).length === 1;
  vscode.commands.executeCommand("setContext", "campfire.valid", valid);
  if (!valid) {
    return;
  }

  getSonar().onFound(student);

  context.subscriptions.push(
    vscode.commands.registerCommand("campfire.start", start)
  );
  context.subscriptions.push(getStatus());
}

// This method is called when your extension is deactivated
export function deactivate() {}

function setup(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider(
    "instructorFiles",
    new InstructorFilesProvider()
  );
}
