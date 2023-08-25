const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode ?   err.statusCode : 500

  res.status(statusCode)
  res.json({
    message: err.message,
    name: err.name,
    // code: err.code,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  }),
  console.log("res.message",err.message)
}

module.exports = errorHandler
