exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      commit: process.env.COMMIT_REF,
      context: process.env.CONTEXT,
      time: new Date().toISOString()
    })
  };
};
