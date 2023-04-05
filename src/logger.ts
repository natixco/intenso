import { yellowBright } from 'colorette';

export function log(text: string): void {
  console.log(yellowBright('[yet] ') + text);
}