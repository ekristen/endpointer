module.exports = {
  name: 'Object Formatted Endpoints',
  description: 'Object Formatted',
  endpoints: [
    {
      name: 'Test',
      description: 'Test',
      method: 'GET',
      path: '/test5',
      fn: function (req, res, next) {
        res.send(200, 'object format');
        return next();
      }
    }
  ]
};
