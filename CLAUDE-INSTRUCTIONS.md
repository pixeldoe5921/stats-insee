# 🤖 CLAUDE CODE - INSTRUCTIONS PROJET

## ⚠️ RÈGLES ABSOLUES CLAUDE

### 🔴 AVANT TOUTE ACTION CRITIQUE :
**Claude DOIT consulter Context 7 avec :**
1. `context7 search "[action] [technology]"`
2. `context7 analyze "project-context [nom-projet]"`
3. `context7 review "similar-patterns"`
4. Appliquer les learnings et éviter les erreurs passées

---

## 📋 ACTIONS NÉCESSITANT CONTEXT 7

### 🚀 DÉPLOIEMENTS
- [ ] Vercel, Netlify, Railway, etc.
- [ ] Docker deployments
- [ ] CI/CD pipelines
- [ ] Variables d'environnement

**Recherches Context 7 :**
```bash
context7 search "deployment [platform] errors"
context7 search "[framework] build issues"
context7 analyze "deployment-checklist"
```

### 🗄️ BASES DE DONNÉES
- [ ] Neon, Supabase, PlanetScale
- [ ] Schémas et migrations
- [ ] Connexions et variables

**Recherches Context 7 :**
```bash
context7 search "database [provider] setup"
context7 search "schema design [type]"
context7 analyze "db-patterns"
```

### 📦 DÉPENDANCES & CONFIG
- [ ] Installation packages majeurs
- [ ] Configurations frameworks
- [ ] Résolution conflits versions

**Recherches Context 7 :**
```bash
context7 search "[package] compatibility"
context7 search "[framework] configuration"
context7 analyze "package-conflicts"
```

### 🔧 INFRASTRUCTURE
- [ ] Docker, Kubernetes
- [ ] Monitoring, logging
- [ ] Sécurité, authentification

**Recherches Context 7 :**
```bash
context7 search "infrastructure [tool]"
context7 analyze "devops-patterns"
```

---

## 🎯 WORKFLOW CLAUDE STANDARD

### 1. 📖 ANALYSE INITIALE
```bash
# Comprendre le contexte projet
context7 analyze "project-overview [nom]"
context7 search "similar-projects [tech-stack]"
```

### 2. 🔍 AVANT ACTION CRITIQUE
```bash
# Consulter expérience passée
context7 search "[action-planifiée] [technologie]"
context7 review "best-practices [domaine]"
```

### 3. ✅ APRÈS SUCCÈS/ÉCHEC
```bash
# Enrichir la base de connaissances
context7 log "success: [action] with [solution]"
context7 log "error: [problème] solved by [fix]"
```

---

## 📊 PROJET ACTUEL

**Nom :** Dashboard Économique INSEE  
**Tech Stack :** Next.js 14, React 18, TypeScript, Tailwind CSS 3  
**Phase :** Déploiement Production (99% complété)  
**Déploiement :** Vercel (en cours de finalisation)  
**Base de données :** Mode démo (Supabase prévu)

---

## 🚨 RAPPELS IMPORTANT

1. **JAMAIS d'action critique sans Context 7**
2. **TOUJOURS rechercher patterns similaires**
3. **TOUJOURS logger succès/échecs**
4. **PRIORISER solutions éprouvées**

---

## 💡 PHRASES CLÉS POUR PROMPTS

> "⚠️ Avant de procéder, consulte Context 7 pour cette action et applique les meilleures pratiques."

> "🔍 Recherche dans Context 7 les erreurs similaires et solutions validées."

> "📚 Utilise Context 7 pour éviter de répéter les erreurs passées."

---

**🎯 OBJECTIF : Capitaliser sur l'expérience et éviter la répétition d'erreurs !**