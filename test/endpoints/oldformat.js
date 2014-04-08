module.exports = {
  name: 'Old Format',
  description: 'Old Format',
  endpoints: [
    {
      name: 'Test Old Format',
      description: 'Test Old Format',
      method: 'GET',
      path: '/test5',
      fn: function (req, res, next) {
        res.send(200, 'no version');
      }
    },
    {
      name: 'Test Old Format 1',
      description: 'Test Old Format 1',
      method: 'GET',
      path: '/test5',
      version: '1.0.0',
      fn: function (req, res, next) {
        res.send(200, '1.0.0');
      }
    },
    {
      name: 'Test Old Format 2',
      description: 'Test Old Format 2',
      method: 'GET',
      path: '/test5',
      version: '1.0.1',
      fn: function (req, res, next) {
        res.send(200, '1.0.1');
      }
    },
    {
      name: 'Test Old Format 3',
      description: 'Test Old Format 3',
      method: 'GET',
      path: '/test5',
      version: '1.0.2',
      fn: function (req, res, next) {
        res.send(200, '1.0.2');
      }
    }
  ]
}
