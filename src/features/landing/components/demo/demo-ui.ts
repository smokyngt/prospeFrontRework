import demoData from './data/demo-content.json';

export const demoUi = {
  get(language?: string) {
    const isFrench = language?.startsWith('fr');
    return isFrench ? demoData.content.fr.ui : demoData.content.en.ui;
  },
};
