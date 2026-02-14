exports.handler = async () => {
  const eta = Math.floor(Math.random() * 20) + 5;

  return {
    statusCode: 200,
    body: JSON.stringify({ eta: `${eta} minutes` })
  };
};
