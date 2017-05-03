const program = require('commander');
const csv = require('csv');
const fs = require('fs');

program
    .version('0.0.1')
    .option('-1, --list [list]', 'list of customers in CSV file')
    .parse(process.argv)

// console.log(program.list);

let parse = csv.parse;
let stream = fs.createReadStream(program.list)
    .pipe(parse({ delimiter : ','}));

stream
    .on('data', function (data) {
       let firstname = data[0];
       let lastname = data[1];
       let email = data[2];
       console.log(firstname, lastname, email);
    });