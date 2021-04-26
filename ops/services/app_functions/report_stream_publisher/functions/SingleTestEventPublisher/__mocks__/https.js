const { EventEmitter } = require('events');

const https = jest.createMockFromModule('https');

const responseQueue = [];

https.__enqueueResponse = options => {
  const {
    body = "",
    headers = {},
    statusCode = 200
  } = options;
  responseQueue.push({
    responseFactory: (cb) => {
      const response = new EventEmitter();
      response.headers = headers;
      response.statusCode = statusCode;

      process.nextTick(() => {
        cb(response);
        if (body) {
          response.emit('data', body);
        }
        response.emit('end');
      });

      return response;
    }
  });
};

https.__enqueueError = err => {
  responseQueue.push({responseError: err});
};

https.__enqueueRequestError = err => {
  responseQueue.push({requestError: err});
};

https.request = (options, cb) => {
  if (responseQueue.length === 0) {
    throw new Error("No canned responses have yet been enqueued.");
  }

  const {requestError, responseFactory, responseError} = responseQueue.shift();
  const request = new EventEmitter();
  process.nextTick(() => {
    if (requestError) {
      request.emit('error', requestError);
    } else if (responseError) {
      const response = new EventEmitter();
      cb(response);
      response.emit('error', responseError);
    } else {
      responseFactory(cb);
    }
  });
  request.end = () => {};
  return request;
};

module.exports = https;
