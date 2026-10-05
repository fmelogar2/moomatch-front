import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let translocoServiceSpy: { setActiveLang: ReturnType<typeof vi.fn>; getActiveLang: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    translocoServiceSpy = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn().mockReturnValue('en'),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    });
  });

  it('uses the stored language when one was previously chosen', () => {
    localStorage.setItem('moomatch.lang', 'es');
    const service = TestBed.inject(LanguageService);

    service.init();

    expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
  });

  it('ignores an unsupported stored language and falls back to the browser locale', () => {
    localStorage.setItem('moomatch.lang', 'fr');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-CO');
    const service = TestBed.inject(LanguageService);

    service.init();

    expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
  });

  it('defaults to English when nothing is stored and the browser locale is unsupported', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');
    const service = TestBed.inject(LanguageService);

    service.init();

    expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('en');
  });

  it('setLanguage persists the choice and updates Transloco', () => {
    const service = TestBed.inject(LanguageService);

    service.setLanguage('es');

    expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
    expect(localStorage.getItem('moomatch.lang')).toBe('es');
  });
});
