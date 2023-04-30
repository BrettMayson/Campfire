// Current mode
var mode: 'searching' | 'student' | 'instructor' = 'searching';

export function setMode(newMode: 'searching' | 'student' | 'instructor') {
  mode = newMode;
}

export function getMode() {
  return mode;
}
