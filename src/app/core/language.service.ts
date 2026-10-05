import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

const STORAGE_KEY = 'moomatch.lang';
const SUPPORTED = ['en', 'es'];

/**
 * User-selectable with browser-locale as the default fallback (see docs/moomatch-HLD.md
 * #Internationalization). Locale affects presentation only — persisted data stays canonical/English.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);

  init(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) {
      this.transloco.setActiveLang(stored);
      return;
    }
    const browserLang = (navigator.language || 'en').slice(0, 2);
    this.transloco.setActiveLang(SUPPORTED.includes(browserLang) ? browserLang : 'en');
  }

  setLanguage(lang: string): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  get current(): string {
    return this.transloco.getActiveLang();
  }
}
