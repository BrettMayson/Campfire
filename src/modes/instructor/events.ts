import * as vscode from "vscode";

import { getMode } from "../../state";

let activeEditor = vscode.window.activeTextEditor;

export function startEvents(context: vscode.ExtensionContext) {
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (getMode() !== "instructor") {
        return;
      }
      if (editor) {
        console.log(`active editor: ${editor.document.fileName}`);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (getMode() !== "instructor") {
        return;
      }
      if (activeEditor && event.document === activeEditor.document) {
        console.log(`document changed: ${event.document.fileName}`);
        event.contentChanges.forEach((change) => {
          console.log({ change });
        });
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidCreateFiles(
    (event) => {
      if (getMode() !== "instructor") {
        return;
      }
      console.log(`files created: ${event.files}`);
    }
  );

  vscode.workspace.onDidDeleteFiles(
    (event) => {
      if (getMode() !== "instructor") {
        return;
      }
      console.log(`files deleted: ${event.files}`);
    }
  );

  vscode.workspace.onDidRenameFiles(
    (event) => {
      if (getMode() !== "instructor") {
        return;
      }
      console.log(`files renamed: ${event.files}`);
    }
  );

  vscode.workspace.onDidSaveTextDocument(
    (document) => {
      if (getMode() !== "instructor") {
        return;
      }
      console.log(`document saved: ${document.fileName}`);
    }
  );
}
