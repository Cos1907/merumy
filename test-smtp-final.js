const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('Testing SMTP connection to cpsrv1.ugurlubilisim.com:587...\n');
  
  const transporter = nodemailer.createTransport({
    host: 'cpsrv1.ugurlubilisim.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: 'no-reply@merumy.com.tr',
      pass: 'tahribat1907'
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,
    debug: true,
    logger: true
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection successful!\n');
    
    console.log('Sending test email...');
    const result = await transporter.sendMail({
      from: 'Merumy <no-reply@merumy.com.tr>',
      to: 'huseyinkulekci0@gmail.com',
      subject: 'Merumy Test Mail - ' + new Date().toISOString(),
      text: 'Bu bir test mailidir. Mail sistemi çalışıyor!',
      html: '<h1>Test Başarılı!</h1><p>Merumy mail sistemi çalışıyor.</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
  }
  
  process.exit(0);
}

testSMTP();
