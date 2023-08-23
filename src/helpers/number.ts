/**
 * Show decimal digits maximum. Eg with precision = 2
 * 0.000022123 => 0.000022
 * 12.345 => 12.34
 * 1234 => 1234
 * 
 * @param x The number
 * @param precision The number of decimal
 */
export const toPrecision = (x: number, precision = 2) => {
    const numberOfDigits = Math.floor(Math.log10(x)) + 1;
    return Intl.NumberFormat('en-US', {
        minimumSignificantDigits: 1,
        maximumSignificantDigits: Math.max(numberOfDigits, precision),
        
    }).format(x)
};
