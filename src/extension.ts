import * as vscode from "vscode";

import { InstructorFilesProvider } from "./views/explorer/instructorFiles";

import { getInstructorFilesProvider, getSonar, getStatus } from "./state";
import start from "./commands/start";
import student from "./modes/student/connect";
import { startEvents } from "./modes/instructor/events";

export function activate(context: vscode.ExtensionContext) {
  setup(context);
  startEvents(context);

  let valid = (vscode.workspace.workspaceFolders || []).length === 1;
  vscode.commands.executeCommand("setContext", "campfire.valid", valid);

  getSonar().onFound(student);

  context.subscriptions.push(
    vscode.commands.registerCommand("campfire.start", start)
  );
  context.subscriptions.push(getStatus());
}

// This method is called when your extension is deactivated
export function deactivate() {}

function setup(context: vscode.ExtensionContext) {
  const instructorFileProvider = getInstructorFilesProvider();
  vscode.window.registerTreeDataProvider(
    "instructorFiles",
    instructorFileProvider
  );
  instructorFileProvider.refresh();
}
