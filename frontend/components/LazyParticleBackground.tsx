import dynamic from 'next/dynamic'

const ParticleBackground = dynamic(
  () => import('./ParticleBackground').then(mod => ({ default: mod.ParticleBackground })),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
  }
)

export { ParticleBackground }