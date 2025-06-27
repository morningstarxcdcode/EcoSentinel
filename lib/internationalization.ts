/**
 * EcoSentinel Internationalization System
 * Multi-language support for global expansion
 * Created by: morningstarxcdcode
 */

export interface Translation {
  [key: string]: string | Translation;
}

export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  dateFormat: string;
  numberFormat: string;
  units: {
    temperature: 'celsius' | 'fahrenheit';
    distance: 'metric' | 'imperial';
    speed: 'kmh' | 'mph';
  };
}

class InternationalizationSystem {
  private translations: Map<string, Translation> = new Map();
  private currentLocale: string = 'en';
  private fallbackLocale: string = 'en';

  private supportedLocales: Map<string, LocaleConfig> = new Map([
    ['en', {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false,
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'en-US',
      units: { temperature: 'fahrenheit', distance: 'imperial', speed: 'mph' }
    }],
    ['es', {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      rtl: false,
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'es-ES',
      units: { temperature: 'celsius', distance: 'metric', speed: 'kmh' }
    }],
    ['fr', {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      rtl: false,
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'fr-FR',
      units: { temperature: 'celsius', distance: 'metric', speed: 'kmh' }
    }],
    ['de', {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      rtl: false,
      dateFormat: 'DD.MM.YYYY',
      numberFormat: 'de-DE',
      units: { temperature: 'celsius', distance: 'metric', speed: 'kmh' }
    }],
    ['zh', {
      code: 'zh',
      name: 'Chinese',
      nativeName: '中文',
      flag: '🇨🇳',
      rtl: false,
      dateFormat: 'YYYY/MM/DD',
      numberFormat: 'zh-CN',
      units: { temperature: 'celsius', distance: 'metric', speed: 'kmh' }
    }]
  ]);

  constructor() {
    this.initializeTranslations();
  }

  private initializeTranslations() {
    // English translations (base)
    this.translations.set('en', {
      common: {
        loading: 'Loading...',
        error: 'Error',
        retry: 'Retry',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        refresh: 'Refresh'
      },
      navigation: {
        dashboard: 'Dashboard',
        map: 'Map',
        predictions: 'AI Insights',
        alerts: 'Alerts',
        settings: 'Settings'
      },
      dashboard: {
        title: 'Environmental Dashboard',
        overallScore: 'Environmental Score',
        airQuality: 'Air Quality',
        temperature: 'Temperature',
        humidity: 'Humidity',
        pressure: 'Pressure',
        windSpeed: 'Wind Speed',
        uvIndex: 'UV Index',
        visibility: 'Visibility',
        lastUpdated: 'Last updated',
        healthRecommendations: 'Health Recommendations',
        environmentalAlerts: 'Environmental Alerts'
      },
      airQuality: {
        good: 'Good',
        moderate: 'Moderate',
        unhealthyForSensitive: 'Unhealthy for Sensitive Groups',
        unhealthy: 'Unhealthy',
        veryUnhealthy: 'Very Unhealthy',
        hazardous: 'Hazardous',
        advice: {
          good: 'Great day for outdoor activities!',
          moderate: 'Unusually sensitive people should consider limiting prolonged outdoor exertion.',
          unhealthyForSensitive: 'Sensitive groups should limit outdoor activities.',
          unhealthy: 'Everyone should limit outdoor activities.',
          veryUnhealthy: 'Avoid outdoor activities.',
          hazardous: 'Stay indoors and keep windows closed.'
        }
      },
      alerts: {
        wildfire: 'Wildfire Alert',
        airQualityCrisis: 'Air Quality Crisis',
        extremeWeather: 'Extreme Weather',
        marineDisaster: 'Marine Emergency',
        evacuate: 'EVACUATE IMMEDIATELY',
        shelterInPlace: 'SHELTER IN PLACE',
        stayIndoors: 'STAY INDOORS'
      }
    });

    // Spanish translations
    this.translations.set('es', {
      common: {
        loading: 'Cargando...',
        error: 'Error',
        retry: 'Reintentar',
        cancel: 'Cancelar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        close: 'Cerrar',
        back: 'Atrás',
        next: 'Siguiente',
        previous: 'Anterior',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        refresh: 'Actualizar'
      },
      navigation: {
        dashboard: 'Panel',
        map: 'Mapa',
        predictions: 'IA Insights',
        alerts: 'Alertas',
        settings: 'Configuración'
      },
      dashboard: {
        title: 'Panel Ambiental',
        overallScore: 'Puntuación Ambiental',
        airQuality: 'Calidad del Aire',
        temperature: 'Temperatura',
        humidity: 'Humedad',
        pressure: 'Presión',
        windSpeed: 'Velocidad del Viento',
        uvIndex: 'Índice UV',
        visibility: 'Visibilidad',
        lastUpdated: 'Última actualización',
        healthRecommendations: 'Recomendaciones de Salud',
        environmentalAlerts: 'Alertas Ambientales'
      },
      airQuality: {
        good: 'Bueno',
        moderate: 'Moderado',
        unhealthyForSensitive: 'No Saludable para Grupos Sensibles',
        unhealthy: 'No Saludable',
        veryUnhealthy: 'Muy No Saludable',
        hazardous: 'Peligroso',
        advice: {
          good: '¡Gran día para actividades al aire libre!',
          moderate: 'Las personas inusualmente sensibles deben considerar limitar el esfuerzo prolongado al aire libre.',
          unhealthyForSensitive: 'Los grupos sensibles deben limitar las actividades al aire libre.',
          unhealthy: 'Todos deben limitar las actividades al aire libre.',
          veryUnhealthy: 'Evitar actividades al aire libre.',
          hazardous: 'Permanezca en interiores y mantenga las ventanas cerradas.'
        }
      },
      alerts: {
        wildfire: 'Alerta de Incendio Forestal',
        airQualityCrisis: 'Crisis de Calidad del Aire',
        extremeWeather: 'Clima Extremo',
        marineDisaster: 'Emergencia Marina',
        evacuate: 'EVACUAR INMEDIATAMENTE',
        shelterInPlace: 'REFUGIARSE EN EL LUGAR',
        stayIndoors: 'PERMANECER EN INTERIORES'
      }
    });

    // Add more languages...
    this.loadAdditionalLanguages();
  }

  private loadAdditionalLanguages() {
    // French translations
    this.translations.set('fr', {
      common: {
        loading: 'Chargement...',
        error: 'Erreur',
        retry: 'Réessayer',
        cancel: 'Annuler',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        refresh: 'Actualiser'
      },
      navigation: {
        dashboard: 'Tableau de Bord',
        map: 'Carte',
        predictions: 'Insights IA',
        alerts: 'Alertes',
        settings: 'Paramètres'
      },
      dashboard: {
        title: 'Tableau de Bord Environnemental',
        overallScore: 'Score Environnemental',
        airQuality: 'Qualité de l\'Air',
        temperature: 'Température',
        humidity: 'Humidité',
        pressure: 'Pression',
        windSpeed: 'Vitesse du Vent',
        uvIndex: 'Indice UV',
        visibility: 'Visibilité',
        lastUpdated: 'Dernière mise à jour',
        healthRecommendations: 'Recommandations Santé',
        environmentalAlerts: 'Alertes Environnementales'
      }
    });

    // German translations
    this.translations.set('de', {
      common: {
        loading: 'Laden...',
        error: 'Fehler',
        retry: 'Wiederholen',
        cancel: 'Abbrechen',
        save: 'Speichern',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        close: 'Schließen',
        back: 'Zurück',
        next: 'Weiter',
        previous: 'Vorherige',
        search: 'Suchen',
        filter: 'Filter',
        sort: 'Sortieren',
        refresh: 'Aktualisieren'
      },
      navigation: {
        dashboard: 'Dashboard',
        map: 'Karte',
        predictions: 'KI-Einblicke',
        alerts: 'Warnungen',
        settings: 'Einstellungen'
      },
      dashboard: {
        title: 'Umwelt-Dashboard',
        overallScore: 'Umwelt-Score',
        airQuality: 'Luftqualität',
        temperature: 'Temperatur',
        humidity: 'Luftfeuchtigkeit',
        pressure: 'Luftdruck',
        windSpeed: 'Windgeschwindigkeit',
        uvIndex: 'UV-Index',
        visibility: 'Sichtweite',
        lastUpdated: 'Zuletzt aktualisiert',
        healthRecommendations: 'Gesundheitsempfehlungen',
        environmentalAlerts: 'Umweltwarnungen'
      }
    });

    // Chinese translations
    this.translations.set('zh', {
      common: {
        loading: '加载中...',
        error: '错误',
        retry: '重试',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        close: '关闭',
        back: '返回',
        next: '下一个',
        previous: '上一个',
        search: '搜索',
        filter: '筛选',
        sort: '排序',
        refresh: '刷新'
      },
      navigation: {
        dashboard: '仪表板',
        map: '地图',
        predictions: 'AI洞察',
        alerts: '警报',
        settings: '设置'
      },
      dashboard: {
        title: '环境仪表板',
        overallScore: '环境评分',
        airQuality: '空气质量',
        temperature: '温度',
        humidity: '湿度',
        pressure: '气压',
        windSpeed: '风速',
        uvIndex: '紫外线指数',
        visibility: '能见度',
        lastUpdated: '最后更新',
        healthRecommendations: '健康建议',
        environmentalAlerts: '环境警报'
      }
    });
  }

  /**
   * Get translation for a key
   */
  public t(key: string, params?: Record<string, string>): string {
    const translation = this.getTranslation(key, this.currentLocale) || 
                       this.getTranslation(key, this.fallbackLocale) || 
                       key;

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  /**
   * Get translation from nested object
   */
  private getTranslation(key: string, locale: string): string | null {
    const translations = this.translations.get(locale);
    if (!translations) return null;

    const keys = key.split('.');
    let current: any = translations;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * Interpolate parameters into translation
   */
  private interpolate(text: string, params: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  /**
   * Set current locale
   */
  public setLocale(locale: string): void {
    if (this.supportedLocales.has(locale)) {
      this.currentLocale = locale;
      this.updateDocumentLanguage(locale);
    }
  }

  /**
   * Get current locale
   */
  public getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Get locale configuration
   */
  public getLocaleConfig(locale?: string): LocaleConfig | undefined {
    return this.supportedLocales.get(locale || this.currentLocale);
  }

  /**
   * Get all supported locales
   */
  public getSupportedLocales(): LocaleConfig[] {
    return Array.from(this.supportedLocales.values());
  }

  /**
   * Format number according to locale
   */
  public formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const config = this.getLocaleConfig();
    const locale = config?.numberFormat || 'en-US';
    
    return new Intl.NumberFormat(locale, options).format(value);
  }

  /**
   * Format date according to locale
   */
  public formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const config = this.getLocaleConfig();
    const locale = config?.numberFormat || 'en-US';
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  /**
   * Format temperature according to locale
   */
  public formatTemperature(celsius: number): string {
    const config = this.getLocaleConfig();
    
    if (config?.units.temperature === 'fahrenheit') {
      const fahrenheit = (celsius * 9/5) + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
    
    return `${Math.round(celsius)}°C`;
  }

  /**
   * Format distance according to locale
   */
  public formatDistance(meters: number): string {
    const config = this.getLocaleConfig();
    
    if (config?.units.distance === 'imperial') {
      if (meters < 1609) {
        const feet = meters * 3.28084;
        return `${Math.round(feet)} ft`;
      } else {
        const miles = meters / 1609.34;
        return `${miles.toFixed(1)} mi`;
      }
    }
    
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      const km = meters / 1000;
      return `${km.toFixed(1)} km`;
    }
  }

  /**
   * Format speed according to locale
   */
  public formatSpeed(kmh: number): string {
    const config = this.getLocaleConfig();
    
    if (config?.units.speed === 'mph') {
      const mph = kmh * 0.621371;
      return `${Math.round(mph)} mph`;
    }
    
    return `${Math.round(kmh)} km/h`;
  }

  /**
   * Detect user's preferred language
   */
  public detectUserLanguage(): string {
    // Browser language detection
    const browserLang = navigator.language.split('-')[0];
    
    if (this.supportedLocales.has(browserLang)) {
      return browserLang;
    }
    
    return this.fallbackLocale;
  }

  /**
   * Update document language attribute
   */
  private updateDocumentLanguage(locale: string): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      
      const config = this.getLocaleConfig(locale);
      if (config?.rtl) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }

  /**
   * Load translations dynamically
   */
  public async loadTranslations(locale: string): Promise<void> {
    if (this.translations.has(locale)) {
      return;
    }

    try {
      // In a real app, this would load from a translation service or file
      const response = await fetch(`/locales/${locale}.json`);
      const translations = await response.json();
      
      this.translations.set(locale, translations);
    } catch (error) {
      console.warn(`Failed to load translations for ${locale}:`, error);
    }
  }

  /**
   * Get air quality description in current language
   */
  public getAirQualityDescription(aqi: number): string {
    if (aqi <= 50) return this.t('airQuality.good');
    if (aqi <= 100) return this.t('airQuality.moderate');
    if (aqi <= 150) return this.t('airQuality.unhealthyForSensitive');
    if (aqi <= 200) return this.t('airQuality.unhealthy');
    if (aqi <= 300) return this.t('airQuality.veryUnhealthy');
    return this.t('airQuality.hazardous');
  }

  /**
   * Get air quality advice in current language
   */
  public getAirQualityAdvice(aqi: number): string {
    if (aqi <= 50) return this.t('airQuality.advice.good');
    if (aqi <= 100) return this.t('airQuality.advice.moderate');
    if (aqi <= 150) return this.t('airQuality.advice.unhealthyForSensitive');
    if (aqi <= 200) return this.t('airQuality.advice.unhealthy');
    if (aqi <= 300) return this.t('airQuality.advice.veryUnhealthy');
    return this.t('airQuality.advice.hazardous');
  }

  /**
   * Get emergency alert message in current language
   */
  public getEmergencyAlertMessage(type: string, severity: string): string {
    const alertType = this.t(`alerts.${type}`);
    const action = severity === 'critical' ? this.t('alerts.evacuate') : this.t('alerts.stayIndoors');
    
    return `🚨 ${alertType}: ${action}`;
  }
}

// Export singleton instance
export const i18n = new InternationalizationSystem();

// React hook for translations
export function useTranslation() {
  return {
    t: (key: string, params?: Record<string, string>) => i18n.t(key, params),
    locale: i18n.getCurrentLocale(),
    setLocale: (locale: string) => i18n.setLocale(locale),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => i18n.formatNumber(value, options),
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => i18n.formatDate(date, options),
    formatTemperature: (celsius: number) => i18n.formatTemperature(celsius),
    formatDistance: (meters: number) => i18n.formatDistance(meters),
    formatSpeed: (kmh: number) => i18n.formatSpeed(kmh)
  };
}
