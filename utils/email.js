const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Tarık Ünal <${process.env.EMAIL_FROM}>`;

    }

    newTransport() {
        /*
        if(process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: 'tarik@gmail.com',
                    pass: 'kfytjt'
                }
            });
        }*/

        return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
           }
    });
    }

    async send(template, subject) {

        
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject: subject
        });
        //pug file alır ve htmle çevrr. ikinci bölümde obje olarak template data gönderdik


        //define email options
    const mailOptions = {
        from: this.from,
        to: this.to,
        subject: subject,
        html: html,
        text: htmlToText.fromString(html)
    };

    await this.newTransport().sendMail(mailOptions);

    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Family');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 min.)')

    }
};


/*
const sendEmail = async options => {
    //create a transporter 
    /*
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        }
    });
    */
   /*
    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
           }
    });

    //define email options
    const mailOptions = {
        from: 'Tarık Ünal <tarikunal@useinsider.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);

};

module.exports = sendEmail;
*/