import * as vscode from "vscode";
import { getInstructorFiles } from "../../state";
import { Directory } from "../../utils/readDirectory";

export class InstructorFilesProvider implements vscode.TreeDataProvider<File> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    File | undefined | null | void
  > = new vscode.EventEmitter<File | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<File | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor() {}

  getTreeItem(element: File): vscode.TreeItem {
    return element;
  }

  getChildren(element?: File): Thenable<File[]> {
    if (element) {
      return Promise.resolve(
        Object.values(element.children || {}).map((file) => {
          return new File(
            element.parent + "/" + element.name,
            file.name,
            file.children,
            file.children
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None
          );
        })
      );
    } else {
      const files = getInstructorFiles();
      return Promise.resolve(
        Object.values(files).map((file) => {
          return new File(
            ".",
            file.name,
            file.children,
            file.children
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None
          );
        })
      );
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class File extends vscode.TreeItem {
  constructor(
    public readonly parent: string,
    public readonly name: string,
    public readonly children: Directory[] | undefined,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(name, collapsibleState);
    this.tooltip = this.name;
    this.contextValue = children ? "directory" : "file";
    this.children = children;
    this.parent = parent;
    if (!children) {
      this.command = {
        title: "View Remote File",
        command: "vscode.open",
        arguments: ["campfire:" + parent + "/" + this.name, 2, "Instructor: " + this.name],
      };
    }
  }

  iconPath = {
    light: "",
    dark: "",
  };
}
