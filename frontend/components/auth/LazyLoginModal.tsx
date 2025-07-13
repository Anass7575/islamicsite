import dynamic from 'next/dynamic'
import { LazyRoute } from '@/components/LazyRoute'

const LoginModal = dynamic(
  () => import('./LoginModal').then(mod => ({ default: mod.LoginModal })),
  {
    loading: () => <LazyRoute><div /></LazyRoute>,
    ssr: false
  }
)

export { LoginModal }