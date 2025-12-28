import type { InvoiceLanguage } from '~/stores/invoice'

export const useInvoiceTranslations = (language: InvoiceLanguage) => {
  const translations = {
    en: {
      invoice: 'INVOICE',
      invoiceNo: 'INVOICE NO:',
      issued: 'ISSUED:',
      dueDate: 'DUE DATE:',
      from: 'From',
      to: 'To',
      description: 'DESCRIPTION',
      quantity: 'QTY.',
      price: 'PRICE',
      total: 'TOTAL',
      subtotal: 'Subtotal:',
      discount: 'Discount',
      tax: 'Tax',
      totalLabel: 'Total:',
      note: 'Note:',
      bankDetails: 'Bank Details',
      bank: 'Bank Name',
      accountNumber: 'Account Number',
      accountName: 'Account Name',
      swiftCode: 'Swift Code',
      routingNumber: 'Routing Code',
      ifscCode: 'IFSC Code',
      payableIn: 'PAYABLE IN:',
      taxId: 'Tax ID:'
    },
    es: {
      invoice: 'FACTURA',
      invoiceNo: 'FACTURA NO:',
      issued: 'EMITIDA:',
      dueDate: 'FECHA DE VENCIMIENTO:',
      from: 'De',
      to: 'Para',
      description: 'DESCRIPCIÓN',
      quantity: 'CANT.',
      price: 'PRECIO',
      total: 'TOTAL',
      subtotal: 'Subtotal:',
      discount: 'Descuento',
      tax: 'Impuesto',
      totalLabel: 'Total:',
      note: 'Nota:',
      bankDetails: 'Detalles Bancarios',
      bank: 'Nombre del Banco',
      accountNumber: 'Número de Cuenta',
      accountName: 'Nombre de la Cuenta',
      swiftCode: 'Swift Code',
      routingNumber: 'Routing Code',
      ifscCode: 'IFSC Code',
      payableIn: 'PAGABLE EN:',
      taxId: 'Tax ID:'
    }
  }

  return translations[language]
}
