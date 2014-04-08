module.exports = function() {
  
  var endpoints = {
    name: 'New Format',
    description: 'New Format',
    endpoints: [
      {
        name: 'Test New Format',
        description: 'Test New Format',
        method: 'GET',
        path: '/test4',
        fn: function (req, res, next) {
          
        }
      }
    ]
  }
  
  return endpoints;

}