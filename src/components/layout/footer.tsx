import { Container } from '@/components/layout/container'

export function Footer() {
  return (
    <footer className="border-t">
      <Container className="py-6">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} 선상낚시 후기 게시판. All rights
            reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
