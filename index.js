const sgMail = require('@sendgrid/mail')

// API REQUEST
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: 'jasmine_akbari+01@amesite.com', 
  from: 'jasmine_akbari@amesite.com', 
  subject: 'First Send Grid Email',
  text: 'This is a test email',
  html: '<strong>This is a test email</strong>',
}

sgMail
  .send(msg)
  .then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
  })
  .catch((error) => {
    console.error(error)
  })
