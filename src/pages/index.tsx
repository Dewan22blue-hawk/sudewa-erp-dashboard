import Link from "next/link"
import { ArrowRight, LayoutDashboard, BarChart3, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ================= HEADER ================= */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="text-lg font-semibold text-primary">
            Wajira
          </div>

          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main className="mx-auto max-w-7xl px-6 py-20">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Wajira Dashboard
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            Sistem dashboard internal untuk monitoring performa keuangan,
            penjualan, dan operasional perusahaan secara real-time.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Masuk ke Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="mt-20 grid gap-6 md:grid-cols-3">
          <Card className="rounded-xl p-6">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-semibold">
              Dashboard Terpusat
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Semua data keuangan dan penjualan ditampilkan dalam satu
              dashboard yang rapi dan mudah dipahami.
            </p>
          </Card>

          <Card className="rounded-xl p-6">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-semibold">
              Insight & Visualisasi
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Grafik dan KPI membantu manajemen mengambil keputusan
              berbasis data secara cepat dan akurat.
            </p>
          </Card>

          <Card className="rounded-xl p-6">
            <Shield className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-semibold">
              Sistem Internal Aman
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Dirancang untuk penggunaan internal perusahaan dengan
              kontrol akses dan struktur data yang siap dikembangkan.
            </p>
          </Card>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Wajira</span>
          <span>Internal Dashboard System</span>
        </div>
      </footer>
    </div>
  )
}
