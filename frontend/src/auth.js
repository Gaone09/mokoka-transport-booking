// Shared auth state — import this instead of App to avoid circular deps
let _listeners = [];

export function notifyAuthChange() {
  _listeners.forEach(fn => fn());
}

export function onAuthChange(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(f => f !== fn); };
}