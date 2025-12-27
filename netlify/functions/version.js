exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      commit: process.env.COMMIT_REF || "unknown",
      context: process.env.CONTEXT || "unknown",
      deployTime: process.env.DEPLOY_TIME || process.env.DEPLOY_TIMESTAMP || "unknown"
    })
  };
};
