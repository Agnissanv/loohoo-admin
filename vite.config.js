import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.dirname(fileURLToPath(import.meta.url));

/*
  RÉPONSE LOCALE POUR L'ADRESSE /api/boutiques-stats

  En ligne, cette adresse est servie par Vercel : une petite fonction serveur qui
  détient des clés privées (absentes de ce dépôt) et interroge la base de chaque
  boutique. En local, cette fonction n'existe pas : sans ce correctif, Vite renvoie
  la page HTML à la place du JSON attendu, d'où l'erreur
  « Unexpected token '<', "<!doctype"... is not valid JSON ».

  Ce bloc ne s'exécute QUE dans le serveur de développement (configureServer) :
  il disparaît complètement de la version compilée et n'a aucun effet en ligne.
  Pour le désactiver : retirer « reponseLocaleApi() » de la ligne plugins ci-dessous.
*/
function reponseLocaleApi() {
  return {
    name: 'reponse-locale-api',
    configureServer(serveur) {
      serveur.middlewares.use('/api/boutiques-stats', (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.statusCode = 200;
        res.end(JSON.stringify([
          {
            id: 'medithe',
            nom: 'MédiThé',
            erreur:
              "Aperçu indisponible en local : cette partie ne fonctionne qu'en ligne (les clés privées qu'elle utilise ne sont pas sur cette machine).",
          },
        ]));
      });
    },
  };
}

/*
  JEU DE DÉMONSTRATION POUR LA SECTION FOURNISSEURS

  En ligne, la section Fournisseurs de l'admin n'est accessible qu'à un compte
  administrateur : la base elle-même refuse la liste des fournisseurs (contacts,
  fiches non publiées) à tout autre compte. Pour pouvoir travailler l'affichage
  sans compte admin et sans risquer de modifier les vraies données, ce greffon
  remplace src/api/admin.js par src/api/admin-demo.js (six fournisseurs de
  démonstration qui couvrent tous les cas d'affichage).

  Il agit UNIQUEMENT sur le serveur de développement (apply: 'serve'), et
  seulement si VITE_DEMO_ADMIN=1 dans .env.local. La version compilée
  (npm run build) et le site en ligne ne sont pas concernés : ni ce greffon, ni
  le fichier de démonstration n'y sont utilisés. Le code de l'application n'est
  pas modifié.

  Pour désactiver la démonstration : VITE_DEMO_ADMIN=0 dans .env.local, puis
  relancer « npm run dev ».
*/
function demoLocale(actif) {
  const fichierDemo = path.resolve(RACINE, 'src/api/admin-demo.js');
  return {
    name: 'demo-locale',
    apply: 'serve',
    // « pre » : indispensable pour passer avant le résolveur interne de Vite,
    // qui sinon remplace le fichier d'origine sans nous laisser le choix.
    enforce: 'pre',
    resolveId(source) {
      if (!actif) return null;
      if (source === './admin.js' || source.endsWith('/api/admin.js')) return fichierDemo;
      return null;
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const demoActive = command === 'serve' && env.VITE_DEMO_ADMIN === '1';

  if (command === 'serve') {
    console.log(
      demoActive
        ? '  ⚠  DÉMONSTRATION LOCALE ACTIVE — la section Fournisseurs utilise des données de démonstration.'
        : '  ℹ  Démonstration locale inactive (données réelles de la base).'
    );
  }

  return {
    plugins: [react(), reponseLocaleApi(), demoLocale(demoActive)],
  };
});
