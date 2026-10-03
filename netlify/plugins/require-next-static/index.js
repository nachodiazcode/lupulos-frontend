const fs = require("fs");
const path = require("path");

function hasCss(dir) {
  if (!fs.existsSync(dir)) return false;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".css")) return true;
    }
  }
  return false;
}

// A Next deploy without .next/static serves the HTML shell and every
// stylesheet 404s. Fail before that publish goes live.
// __dirname stays at the plugin folder; process.cwd() does not.
module.exports = {
  onPostBuild({ constants, utils }) {
    const candidates = [
      path.join(__dirname, "../../../.next/static"),
      constants.PUBLISH_DIR ? path.join(constants.PUBLISH_DIR, "static") : "",
    ].filter(Boolean);
    if (!candidates.some(hasCss)) {
      utils.build.failBuild(
        `No se publica: no hay CSS de Next en ${candidates.join(" ni ")}.`
      );
    }
  },
};
