import * as vscode from 'vscode';

export class InstructorFilesProvider implements vscode.TreeDataProvider<File> {
  constructor() {
  }

  getTreeItem(element: File): vscode.TreeItem {
    return element;
  }

  getChildren(element?: File): Thenable<File[]> {
    return Promise.resolve([
      new File('test', '1.0', vscode.TreeItemCollapsibleState.None),
    ]);
  }
}

class File extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }

  iconPath = {
    light: '',
    dark: '',
  };
}

/// Server: 1234
/// Client: 1234

/// When client started
/// Client -> Router: Broadcast for Campfire:1234
/// Router -> Server: Campfire:1234:192.168.1.123
/// Server -> Client: Campfire:1234:192.168.1.312
/// Client -> Server: Campfire:hello

/// When server started
/// Server -> Router: Broadcast for Campfire:1234
/// Router -> Client: Campfire:1234:192.168.1.312
/// Client -> Server: Campfire:1234:hello