/// <reference path="./typings/index.d.ts" />
const Fetch = require("./lib/fetch");
let fetch = new Fetch();
let save = require("./lib/save");

fetch.start().then(save);