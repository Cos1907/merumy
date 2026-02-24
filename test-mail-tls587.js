const nodemailer = require('nodemailer');

// TLS 587 port ile test
const transporter = nodemailer.createTransport({
  host: 'cpsrv1.ugurlubilisim.com',
  port: 587,
  secure: false, // TLS için false
  auth: {
    user: 'no-reply@merumy.com.tr',
    pass: 'tahribat1907'
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  debug: true,
  logger: true
});

console.log('Testing TLS 587 connection...');

transporter.verify()
  .then(() => {
    console.log('✅ Connection OK!');
    return transporter.sendMail({
      from: 'Merumy <no-reply@merumy.com.tr>',
      to: 'huseyinkulekci0@gmail.com',
      subject: 'Test Mail TLS 587 - ' + new Date().toISOString(),
      text: 'Bu bir TLS 587 port test mailidir.',
      html: '<h1>Test Başarılı!</h1><p>TLS 587 port ile mail gönderildi.</p>'
    });
  })
  .then(result => {
    console.log('✅ Mail sent!', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });





