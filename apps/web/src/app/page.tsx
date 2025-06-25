export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          🇫🇷 Dashboard Économique INSEE
        </h1>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Fonctionnalités</h2>
          <ul className="space-y-2">
            <li>✅ Données économiques françaises (INSEE)</li>
            <li>✅ Données européennes (Eurostat)</li>
            <li>✅ Graphiques interactifs</li>
            <li>✅ Export PDF/CSV</li>
            <li>✅ Interface conversationnelle IA</li>
            <li>✅ Architecture Next.js 14 + TypeScript</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Déploiement réussi ! L'application sera complètement fonctionnelle
            après configuration des clés API Supabase et INSEE.
          </p>
        </div>
      </div>
    </main>
  )
}