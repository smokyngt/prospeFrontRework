import { demoContent } from './demo-config';

export function getDemoCopy(language?: string) {
  return demoContent.get(language);
}
