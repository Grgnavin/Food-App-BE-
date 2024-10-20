import { generatePasswordResetEmailHtml, generateResetSuccessEmailHtml, generateWelcomeEmailHtml, htmlContent } from "./emailHTML";
import { client, sender } from "./mailTrap";

export const sendVerificationEmail = async (email:string, verificationToken: string) => {
    const recipient = [{ email }];
    try {
        const res = await client.send({
                    from: sender,
                    to: recipient,
                    subject: "Verify your email",
                    html: htmlContent.replace("{verificationToken}", verificationToken),
                    category: "Email Verification",
                });
    } catch (error) {
        console.log(error);
        throw new Error("Failed to send email verification");
    }
}

export const welcomeEmail = async (email:string, name: string) => {
    const recipient = [{ email }];
    const htmlContent = generateWelcomeEmailHtml(name);
    try {
        const res = await client.send({
                    from: sender,
                    to: recipient,
                    subject: "Welcome to MelodyEats",
                    html: htmlContent, 
                    category: "Welcome Email",
                    template_variables: {
                        company_info_name: "MelodyEats",
                        name: name
                    }
                });
    } catch (error) {
        console.log(error);
        throw new Error("Failed to send welcome email");
    }
};

export const sendPasswordResetEmail = async (email:string, resetUrl: string) => {
    const recipient = [{ email }];
    const htmlContent = generatePasswordResetEmailHtml(resetUrl);
    try {
        const res = await client.send({
                    from: sender,
                    to: recipient,
                    subject: "Reset your password",
                    html: htmlContent, 
                    category: "Reset Password",
                });
    } catch (error) {
        console.log(error);
        throw new Error("Failed to send passwordreset email");
    } 
}

export const sendResetSuccessEmail = async (email:string, resetUrl: string) => {
    const recipient = [{ email }];
    const htmlContent = generateResetSuccessEmailHtml();
    try {
        const res = await client.send({
                    from: sender,
                    to: recipient,
                    subject: "Password Reset successfully",
                    html: htmlContent, 
                    category: "Password Reset",
                });
    } catch (error) {
        console.log(error);
        throw new Error("Failed to send password reset success email");
    } 
}