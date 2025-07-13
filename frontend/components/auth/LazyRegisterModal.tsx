import dynamic from 'next/dynamic'
import { LazyRoute } from '@/components/LazyRoute'

const RegisterModal = dynamic(
  () => import('./RegisterModal').then(mod => ({ default: mod.RegisterModal })),
  {
    loading: () => <LazyRoute><div /></LazyRoute>,
    ssr: false
  }
)

export { RegisterModal }