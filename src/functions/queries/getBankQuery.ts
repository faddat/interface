export const getBankQuery = (address: string) => {
  return `
        balance: bank {
            balance(address: "${address}") {
                amount
                denom
            }
        }
    `
}
