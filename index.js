require('dotenv').config();
const sgMail = require('@sendgrid/mail')

// API REQUEST
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

function getMessage(data) {

    return {
        from: {
            email: data.from,
            name: data.fromname
        },
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: `<strong>${data.text}</strong>`,
    };
}
  
  async function sendEmail() {
    const contact_us_email = process.env.CONTACT_US_EMAIL;

    const email_data = {
        from: contact_us_email,
        fromname: 'Amesite',
        to: 'jasmine_akbari@amesite.com',
        subject: 'Test email with Node.js and SendGrid',
        text: 'This is a test email using SendGrid from Node.js'
    }

    try {
        await sgMail.send(getMessage(email_data));
        console.log('Test email sent successfully');
    } catch (error) {
        console.error('Error sending test email');
        console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
    }
  }



(async () => {
    console.log('Sending test email');
    await sendEmail();
})();
