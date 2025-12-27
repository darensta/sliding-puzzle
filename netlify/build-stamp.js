const fs = require("fs");

const stamp = {
  commit: process.env.COMMIT_REF || "unknown",
  context: process.env.CONTEXT || "unknown",
  deployTime: new Date().toISOString()
};

const payload = `exports.handler = async () => ({
  statusCode: 200,
  body: JSON.stringify(${JSON.stringify(stamp, null, 2)})
});`;

fs.writeFileSync("./netlify/functions/version.js", payload);
