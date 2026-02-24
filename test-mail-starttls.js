const nodemailer = require('nodemailer');

async function testAllConfigurations() {
  const configs = [
    // Config 1: Port 587 with STARTTLS (opportunistic)
    {
      name: 'Port 587 STARTTLS Opportunistic',
      host: 'cpsrv1.ugurlubilisim.com',
      port: 587,
      secure: false,
      auth: { user: 'no-reply@merumy.com.tr', pass: 'tahribat1907' },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 20000,
      greetingTimeout: 20000
    },
    // Config 2: Port 25 without TLS
    {
      name: 'Port 25 No TLS',
      host: 'cpsrv1.ugurlubilisim.com',
      port: 25,
      secure: false,
      ignoreTLS: true,
      auth: { user: 'no-reply@merumy.com.tr', pass: 'tahribat1907' },
      connectionTimeout: 20000,
      greetingTimeout: 20000
    },
    // Config 3: Port 465 SSL
    {
      name: 'Port 465 SSL',
      host: 'cpsrv1.ugurlubilisim.com',
      port: 465,
      secure: true,
      auth: { user: 'no-reply@merumy.com.tr', pass: 'tahribat1907' },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 20000,
      greetingTimeout: 20000
    },
    // Config 4: Direct IP Port 587
    {
      name: 'Direct IP 162.55.99.57:587',
      host: '162.55.99.57',
      port: 587,
      secure: false,
      auth: { user: 'no-reply@merumy.com.tr', pass: 'tahribat1907' },
      tls: { rejectUnauthorized: false, servername: 'cpsrv1.ugurlubilisim.com' },
      connectionTimeout: 20000,
      greetingTimeout: 20000
    }
  ];

  for (const config of configs) {
    console.log(`\n=== Testing: ${config.name} ===`);
    const name = config.name;
    delete config.name;
    
    const transporter = nodemailer.createTransport(config);
    
    try {
      await transporter.verify();
      console.log(`✅ ${name}: Connection OK!`);
      
      // Send test mail
      const result = await transporter.sendMail({
        from: 'Merumy <no-reply@merumy.com.tr>',
        to: 'huseyinkulekci0@gmail.com',
        subject: `Mail Test ${name} - ${Date.now()}`,
        text: 'Test successful!'
      });
      console.log(`✅ ${name}: Mail sent!`, result.messageId);
      process.exit(0);
    } catch (err) {
      console.log(`❌ ${name}: Failed -`, err.message);
    }
  }
  
  console.log('\n❌ All configurations failed');
  process.exit(1);
}

testAllConfigurations();





