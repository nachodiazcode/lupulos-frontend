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
module.exports = {
  onPostBuild({ utils }) {
    const staticDir = path.join(process.cwd(), ".next", "static");
    if (!hasCss(staticDir)) {
      utils.build.failBuild(
        "No se publica: el build de Next no generó CSS en .next/static. Esa publicación deja la página sin estilos."
      );
    }
  },
};
