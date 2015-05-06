module.exports = function() {
  
  var endpoints = {
    name: 'Function Format',
    description: 'Function Format',
    endpoints: [
      {
        name: 'Test New Format',
        description: 'Test New Format',
        method: 'GET',
        path: '/test6',
        fn: function (req, res, next) {
          res.send(200, 'function format');
          return next();
        }
      }
    ]
  };
  
  return endpoints;

};
