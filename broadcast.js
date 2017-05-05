const program = require('commander');
const csv = require('csv');
const fs = require('fs');
const inquirer = require('inquirer');
const async = require('async');
const chalk = require('chalk');

program
    .version('0.0.2')
    .option('-l, --list [list]', 'list of customers in CSV file')
    .parse(process.argv);

let questions = [
    {
        type : "input",
        name : "sender.email",
        message : "Sender's email address - "
    },
    {
        type : "input",
        name : "sender.name",
        message : "Sender's name -"
    },
    {
        type : "input",
        name : "subject",
        message : "Subject -"
    }
];

let contactList = [];
let parse = csv.parse;
let stream = fs.createReadStream(program.list)
    .pipe(parse({ delimiter : ','}));

let __sendEmail = function (to, from, subject, callback) {
    let template = "Hi, how are you doing?";
    let helper = require('sendgrid').mail;
    let fromEmail = new helper.Email(from.email, from.name);
    let toEmail = new helper.Email(to.email, to.name);
    let body = new helper.Content("text/plain", template);
    let mail = new helper.Mail(fromEmail, subject, toEmail, body);

    let sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
    let request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
        if (error) { return callback(error); }
        callback();
    });
};

stream
    .on("error", function (err) {
        return console.error(err.response);
    })
    .on("data", function (data) {
       let name = data[0] + " " + data[1];
       let email = data[2];
       contactList.push({ name : name, email : email});

    })
    .on("end", function () {
        console.log('Details of employees in csv file :');
        console.log(contactList);
        console.log('------------------------------------------------------------------------');
        console.log('Enter Sender Details :');
        inquirer.prompt(questions).then(function (ans) {
            async.each(contactList, function (recipient, fn) {
               __sendEmail(recipient, ans.sender, ans.subject, fn);
            }, function (err) {
                if (err) {
                    return console.error(chalk.red(err.message));
                }
                console.log(chalk.green('Success'));
            });
        });
    });
