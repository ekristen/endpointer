[![Build Status](https://travis-ci.org/ekristen/restify-endpoints.png)](https://travis-ci.org/ekristen/restify-endpoints)
[![npm version](https://badge.fury.io/js/restify-endpoints.svg)](http://badge.fury.io/js/restify-endpoints)

# Overview

Version 1.0.5 has been released

Development status: active development, beta

The purpose of this library is to help manage your RESTful endpoints for Restify. One of the biggest challenges to creating and maintaining and API service is it's documentation, Restify Endpoints tries to help solve this problem by allowing you to auto-generate documentation based on all your defined code. Instead of writing documentation separately, write it while you code, in your code.

# Features

## Autodiscovery

By placing files in a directory with the proper format you can auto-discover endpoints with this library. This means you can write a simple endpoints file that supports multiple middleware, versions, and methods and place it into a directory and the library will discover and include them automatically.

## Afterware

Like middleware, but it goes after your main endpoint handler. This means you cannot modify the `response` in this function. It is useful or taking action on the request after your primary action has already been done. For example, lets say your main handler sets certain headers or flags on the request object, the afterware can read these values and take futher action after the primary response has already been sent back to the user.

## Single or Multiple (Everything), Your Choice

When defining an endpoint you can define a single method, middleware, version, OR you can specifiy multiple and if you are using the autodiscovery feature, all you have to do is attach the endpoint manager to the restify server and you are done. See an example below.

### Example
```
module.exports = {
  name: 'Example',
  description: 'Example Endpoints',
  endpoints: [
    {
      name: 'Example',
      description: 'Default Example Endpoint',
      method: 'GET',
      path: [
        '/example',
        '/example2',
        '/example3',
      ],
      version: '1.0.0',
      middleware: name_of_middleware_function,
      fn: function (req, res, next) {
        res.send({"status": "ok", "message": "Example Default Endpoint"});
        return next();
      }
    },
    {
      name: 'getExample',
      description: 'Get Example Data Endpoint',
      method: 'GET',
      auth: false,
      path: '/example/:id',
      version: [
        '1.0.0',
        '1.1.0'
      ],
      middleware: [
        name_of_function1,
        name_of_function2
      ]
      fn: function (req, res, next) {
        res.send(data[req.params.id]);
        return next();
      }
    }
  ]
}
```

# Roadmap

* Auto-generate Docs - Support more then markdown format as export.
* Endpoint Middleware Support - better support for additional plugins/middleware that can be used against the endpoints?

# Installation

## npm

### npm registry 

```
npm install restify-endpoints --save
```

### git repository

```
npm install git+https://github.com/ekristen/restify-endpoints.git
```

# Credits / Thanks
A special thanks to https://github.com/robertklep for helping me visualize how to build the project and for the first iteration of the endpoints manager class.
