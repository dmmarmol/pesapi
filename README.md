# PES Database API
> Using node.js

The main goal of this project is to support a JSON Rest API with data fetched from [pesdb.net](http://pesdb.net) to allow different operations and manipulation of the data.

This project was indented to be a proof of concept involving web scrapping and many npm libraries to gather public data from a public website and then create a simple REST API to retrieve it.

### References
- [Scrapping the web with node.js](https://scotch.io/tutorials/scraping-the-web-with-node-js)
- [Simple Async/Await Example](https://gist.github.com/wesbos/1866f918824936ffb73d8fd0b02879b4)
- [Using `Promise.all` to resolve multiple request](https://stackoverflow.com/questions/45389677/using-promise-all-to-resolve-fetch-requests)

> This proyect uses yarn to handle dependencies

### Install

Clone this project and `cd` into it and run

#### If you have [Yarn](https://yarnpkg.com/)
```
yarn && yarn start 
```

At this moment the gathered information should be placed inside an `./output` directory and inside a sub directory with the corresponding version name, year and  month. Eg.: `./output/{version}/{year}/{month}/players.json`