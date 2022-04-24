const headers = require('./headers');
const errorHandler = (res, err) => {
  res.writeHead(400, headers);
  let message = '';
  if (err) {
    message = err.message;
  } else {
    message = '欄位沒有正確，或沒有此 ID';
  }
  res.write(
    JSON.stringify({
      status: 'error',
      message,
    })
  );
  res.end();
};
module.exports = errorHandler;
