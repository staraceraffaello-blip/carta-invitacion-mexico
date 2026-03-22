import { deliveryConfirmation } from './api/lib/email-templates.js';
import fs from 'fs';

const html = deliveryConfirmation({
  guestName: 'María González López',
  companionNames: ['Carlos González López', 'Ana González López'],
  planLabel: 'Plan Completo',
  orderDate: '6 de marzo de 2026',
  orderId: 'ORD-2026-0306',
  amountLabel: '$9.00 USD'
});

fs.writeFileSync('email-preview.html', html, 'utf8');
console.log('Wrote email-preview.html');
