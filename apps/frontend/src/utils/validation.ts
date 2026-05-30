export function validateSpanishID(id: string): boolean {
  const cleanId = id.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanId.length !== 9) return false;

  const firstChar = cleanId.charAt(0);
  const lastChar = cleanId.charAt(8);

  if (/^[0-9XYZ]/.test(firstChar)) {
    let number = cleanId.substring(0, 8);
    if (firstChar === 'X') number = '0' + number.substring(1);
    else if (firstChar === 'Y') number = '1' + number.substring(1);
    else if (firstChar === 'Z') number = '2' + number.substring(1);

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const expectedLetter = letters.charAt(parseInt(number, 10) % 23);
    return expectedLetter === lastChar;
  }

  if (/^[ABCDEFGHJNPQRSUVW]/.test(firstChar)) {
    const digits = cleanId.substring(1, 8);
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let d = parseInt(digits.charAt(i), 10);
      if (i % 2 === 0) {
        d *= 2;
        sum += (d > 9 ? d - 9 : d);
      } else {
        sum += d;
      }
    }
    const controlDigit = (10 - (sum % 10)) % 10;
    const controlLetter = 'JABCDEFGHI'.charAt(controlDigit);

    if (/[KPQS]/.test(firstChar)) {
      return lastChar === controlLetter;
    } else if (/[ABEH]/.test(firstChar)) {
      return lastChar === controlDigit.toString();
    } else {
      return lastChar === controlLetter || lastChar === controlDigit.toString();
    }
  }

  return false;
}
