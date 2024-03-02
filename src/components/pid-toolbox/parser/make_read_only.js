export function makeReadOnly(x) {
  // Make read-only if browser supports it:
  if (Object.freeze) {
    return Object.freeze(x);
  }

  // Otherwise a no-op
  return x;
}
