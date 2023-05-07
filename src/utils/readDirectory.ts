import * as vscode from "vscode";

export type Directory = {
  name: string;
  children?: Directory[];
};

export async function readDirectory(root: vscode.Uri): Promise<Directory[]> {
  let structure = [];
  let files = await vscode.workspace.fs.readDirectory(root);
  for (let file of files) {
    if (file[1] === vscode.FileType.Directory) {
      let children = await readDirectory(vscode.Uri.joinPath(root, file[0]));
      structure.push({
        name: file[0],
        children,
      });
    } else {
      structure.push({
        name: file[0],
      });
    }
  }
  return structure;
}
