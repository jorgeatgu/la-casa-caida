// src/scripts/main.js
import { menu, changeLanguage, animation } from './shared/index.js';

document.addEventListener('DOMContentLoaded', () => {
  menu();
  animation();
  changeLanguage();
});
