# PES Database API
> Using node.js

The main goal of this project is to support a JSON Rest API with data fetched from [pesdb.net](http://pesdb.net) to allow different operations and manipulation of the data.

This project was indented to be a proof of concept involving web scrapping and many npm libraries to gather public data from a public website and then create a simple REST API to retrieve it.

### References
- [Scrapping the web with node.js](https://scotch.io/tutorials/scraping-the-web-with-node-js)
- [Using `Promise.all` to resolve multiple request](https://stackoverflow.com/questions/45389677/using-promise-all-to-resolve-fetch-requests)


### Install

Clone this project and `cd` into it and run

#### If you have [Yarn](https://yarnpkg.com/)
```
yarn && yarn start 
```

#### If not, then classic `npm install`
```
npm install && npm run start
```

At this moment the gathered information should be placed inside an `./output` directory and inside a sub directory with the corresponding version name. Eg.: `./output/v0.0.2/players_...`