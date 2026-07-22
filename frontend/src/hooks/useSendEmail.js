import { useState } from 'react';
import { sendEmailRequest } from '../api/email';

export function useSendEmail() {
  const [emailStatus, setEmailStatus] = useState('');

  async function sendEmail(templateType, data) {
    setEmailStatus('Sending...');
    const email = localStorage.getItem('email');

    try {
      const result = await sendEmailRequest(templateType, email, data);
      setEmailStatus(result.success ? 'Email sent!' : 'Failed to send email.');
    } catch (error) {
      console.error(error);
      setEmailStatus('An error occurred.');
    }

    setTimeout(() => setEmailStatus(''), 2000);
  }

  return { sendEmail, emailStatus };
}