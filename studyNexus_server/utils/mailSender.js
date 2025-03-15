const nodemailer=require("nodemailer");

exports.mailSender=async (email,title,body)=>{
    try {
        const transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          });
          
          
          async function main() {
           
            const info = await transporter.sendMail({
              from: 'STUDY NEXUS BY ALI ANSARI <aliansari8179@gmail.com>',
              to: `${email}`, 
              subject: `${title}`, 
              html: `${body}`, 
            });
          
            console.log("Message sent: %s", info);
            return info;

            
          }
          
          return main();
    } catch (error) {
        console.log("something is wrong while writing mail ",error.message);
    }
}