import * as vscode from "vscode";

import { InstructorFilesProvider } from "./views/explorer/instructorFiles";

import { getInstructorFilesProvider, getSonar, getStatus, getStudent, setStudent } from "./state";
import start from "./commands/start";
import { startEvents } from "./modes/instructor/events";
import { LocalStudent } from "./modes/student/connect";

export function activate(context: vscode.ExtensionContext) {
  setup(context);
  startEvents(context);

  let valid = (vscode.workspace.workspaceFolders || []).length === 1;
  vscode.commands.executeCommand("setContext", "campfire.valid", valid);

  getSonar().onFound((remote) => {
    setStudent(new LocalStudent(remote));
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("campfire.start", start)
  );
  context.subscriptions.push(getStatus());

  vscode.workspace.registerTextDocumentContentProvider(
    "campfire",
    new (class implements vscode.TextDocumentContentProvider {
      async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const student = getStudent();
        let contents = await student?.fileContents(uri.path);
        console.log({ contents });
        if (contents !== undefined) {
          return contents;
        } else {
          return "";
        }
      }
    })
  );
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
