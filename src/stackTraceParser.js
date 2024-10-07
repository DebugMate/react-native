/**
 * Parses an error object to extract relevant information from its stack trace.
 *
 * This function processes the stack trace and returns a list of sources
 * that indicate the function name, file name, line number, and column number where the error occurred.
 *
 * @param {Error} error - The error object to parse.
 * @returns {Object} An object containing an array of sources and the original stack trace.
 * @property {Array<{function: string, file: string, line: string, column: string}>} sources - List of parsed stack trace sources.
 * @property {string} stack - The original stack trace string.
 */
export function parse(error) {
  if (!error.stack) {
    return { sources: [], stack: "" };
  }

  const stacklist = error.stack
    .replace(/\n+/g, "\n")
    .split("\n")
    .filter((item, index, array) => {
      return !!item && index === array.indexOf(item);
    });

  const stackReg = /at\s+([^\s]+)\s+\(([^:]+):(\d+):(\d+)\)/i;
  const stackReg2 = /at\s+([^\s]+)\s+([^\s]+):(\d+):(\d+)/i;

  const sources = [];
  stacklist.forEach((item) => {
    let match = stackReg.exec(item) || stackReg2.exec(item);
    if (match && match.length >= 5) {
      sources.push({
        function: match[1] || "unknown",
        file: match[2] || "unknown",
        line: match[3] || "unknown",
        column: match[4] || "unknown",
      });
    }
  });

  const stack = stacklist.join("\n");

  return { sources, stack };
}
