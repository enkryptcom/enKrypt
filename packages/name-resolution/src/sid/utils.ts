const paymentIdRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+$/
export const isValidPaymentId = (id: string) => paymentIdRegex.test(id)

