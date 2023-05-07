import * as vscode from "vscode";
import { Sonar } from "./sonar";
import { InstructorFilesProvider } from "./views/explorer/instructorFiles";
import { Directory } from "./utils/readDirectory";
import { LocalStudent } from "./modes/student/connect";

// Mode
var mode: "searching" | "student" | "instructor" = "searching";
export function setMode(newMode: "searching" | "student" | "instructor") {
  mode = newMode;
  vscode.commands.executeCommand("setContext", "campfire.mode", newMode);
  switch (newMode) {
    case "searching":
      hideStatus();
      student = undefined;
      break;
    case "student":
      setStatus("$(flame) Connected");
      break;
    case "instructor":
      student = undefined;
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

var student: LocalStudent | undefined = undefined;
export function getStudent() {
  return student;
}
export function setStudent(newStudent: LocalStudent) {
  student = newStudent;
  setMode("student");
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

// Remote Instructor State
var instructorState: {
  files: Directory[],
} = {
  files: []
};

export function setInstructorState(state: {
  files: Directory[],
}) {
  instructorState = state;
}

export function getInstructorState() {
  return instructorState;
}

export function getInstructorFiles() {
  return instructorState.files;
}

export function setInstructorFiles(files: Directory[]) {
  instructorState.files = files;
  getInstructorFilesProvider().refresh();
}

// Instructor Files Provider
var instructorFilesProvider: InstructorFilesProvider = new InstructorFilesProvider();

export function getInstructorFilesProvider() {
  return instructorFilesProvider;
}
