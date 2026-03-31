export function normalizeNumbers(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return "";
  const str = input.toString();
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    const regex = new RegExp(bengaliDigits[i], "g");
    result = result.replace(regex, englishDigits[i]);
  }
  return result;
}
