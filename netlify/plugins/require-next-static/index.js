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

// The Next runtime renames publish dirs before other onPostBuild hooks.
// A good deploy has the CSS either still in .next/static or already
// moved to .next/_next/static, which is what the CDN serves.
module.exports = {
  onPostBuild({ constants, utils }) {
    const root = path.join(__dirname, "../../..");
    const publishDir = path.resolve(root, constants.PUBLISH_DIR || ".next");
    const candidates = [
      path.join(publishDir, "_next/static"),
      path.join(publishDir, "static"),
    ];
    if (!candidates.some(hasCss)) {
      utils.build.failBuild(
        `No se publica: no hay CSS de Next en ${candidates.join(" ni ")}.`
      );
    }
  },
};
