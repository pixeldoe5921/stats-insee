// 🔍 Configuration Sentry pour monitoring d'erreurs
// Dashboard INSEE - Monitoring avancé

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.NODE_ENV || 'development';

Sentry.init({
  dsn: SENTRY_DSN,
  environment,
  
  // Performance Monitoring
  tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
  
  // Session Replay pour debugging
  replaysSessionSampleRate: environment === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Configuration spécifique économie
  beforeSend(event, hint) {
    // Filtrer les erreurs non critiques
    if (event.exception) {
      const error = hint.originalException;
      
      // Ignorer les erreurs réseau temporaires
      if (error?.message?.includes('Network Error') || 
          error?.message?.includes('fetch')) {
        return null;
      }
      
      // Enrichir les erreurs INSEE/Eurostat
      if (error?.message?.includes('INSEE') || 
          error?.message?.includes('EUROSTAT')) {
        event.tags = {
          ...event.tags,
          dataSource: 'external_api',
          criticality: 'high'
        };
      }
    }
    
    return event;
  },

  // Tags personnalisés
  initialScope: {
    tags: {
      component: "insee-dashboard",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"
    },
  },

  // Intégrations spécifiques
  integrations: [
    new Sentry.BrowserTracing({
      // Tracer les navigations
      routingInstrumentation: Sentry.nextRouterInstrumentation(router),
      
      // Tracer les requêtes API
      tracingOrigins: [
        'localhost',
        'api.insee.fr',
        'ec.europa.eu',
        /^https:\/\/.*\.vercel\.app/,
      ],
    }),
    
    // Session Replay
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Configuration release
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Filtres de données sensibles
  beforeBreadcrumb(breadcrumb) {
    // Masquer les clés API dans les logs
    if (breadcrumb.data?.url) {
      breadcrumb.data.url = breadcrumb.data.url.replace(
        /(api_?key=)[^&]*/gi, 
        '$1***'
      );
    }
    return breadcrumb;
  }
});

// Fonctions utilitaires pour le monitoring
export const captureEconomicDataError = (error, context) => {
  Sentry.withScope((scope) => {
    scope.setContext("economic_data", context);
    scope.setLevel("error");
    Sentry.captureException(error);
  });
};

export const capturePerformanceMetric = (metric, value) => {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${metric}: ${value}ms`,
    level: 'info',
    data: { metric, value }
  });
};

export const captureUserAction = (action, data) => {
  Sentry.addBreadcrumb({
    category: 'user',
    message: action,
    level: 'info',
    data
  });
};