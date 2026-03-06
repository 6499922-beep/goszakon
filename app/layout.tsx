import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GOSZAKON — практика жалоб в ФАС по 223-ФЗ",
  description:
    "Экспертный портал по практике жалоб в ФАС по 223-ФЗ. Реальные кейсы, защита интересов поставщиков, анализ закупок.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}
      >
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#081a4b] shadow-sm">
                <span className="text-sm font-bold tracking-[0.24em] text-white">
                  GZ
                </span>
              </div>

              <div>
                <div className="text-lg font-bold tracking-tight text-[#081a4b]">
                  GOSZAKON
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Практика жалоб в ФАС по 223-ФЗ
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
              <Link href="/cases" className="text-slate-700 hover:text-[#081a4b]">
                Практика ФАС
              </Link>

              <Link href="/o-proekte" className="text-slate-700 hover:text-[#081a4b]">
                О проекте
              </Link>

              <Link
                href="/narusheniya-tovarnyj-znak"
                className="text-slate-700 hover:text-[#081a4b]"
              >
                Нарушения
              </Link>

              <Link
                href="/uslugi/skrytaya-zhaloba"
                className="text-slate-700 hover:text-[#081a4b]"
              >
                Услуги
              </Link>

              <Link href="/#request" className="text-slate-700 hover:text-[#081a4b]">
                Проверить закупку
              </Link>
            </nav>

            <div className="hidden items-center gap-5 lg:flex">
              <a
                href="tel:84956680706"
                className="text-sm font-semibold text-[#081a4b]"
              >
                8 (495) 668-07-06
              </a>

              <a
                href="mailto:info@goszakon.ru"
                className="text-sm text-slate-600 hover:text-[#081a4b]"
              >
                info@goszakon.ru
              </a>

              <a
                href="/#request"
                className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0d2568]"
              >
                Отправить закупку
              </a>
            </div>
          </div>
        </header>

        {children}

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#081a4b]">
                    <span className="text-xs font-bold tracking-[0.22em] text-white">
                      GZ
                    </span>
                  </div>

                  <div>
                    <div className="text-lg font-bold text-[#081a4b]">
                      GOSZAKON
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Практика жалоб в ФАС
                    </div>
                  </div>
                </Link>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                  Экспертный портал по практике жалоб в ФАС по 223-ФЗ, защите
                  интересов поставщиков и анализу закупочной документации.
                </p>
              </div>

              <div className="grid gap-3 text-sm text-slate-600 md:justify-end">
                <Link href="/cases" className="hover:text-[#081a4b]">
                  Практика ФАС
                </Link>

                <Link href="/o-proekte" className="hover:text-[#081a4b]">
                  О проекте
                </Link>

                <Link
                  href="/narusheniya-tovarnyj-znak"
                  className="hover:text-[#081a4b]"
                >
                  Нарушения
                </Link>

                <Link
                  href="/uslugi/skrytaya-zhaloba"
                  className="hover:text-[#081a4b]"
                >
                  Защита поставщика
                </Link>

                <a href="tel:84956680706" className="hover:text-[#081a4b]">
                  8 (495) 668-07-06
                </a>

                <a href="mailto:info@goszakon.ru" className="hover:text-[#081a4b]">
                  info@goszakon.ru
                </a>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
              <div className="mb-2 font-semibold text-slate-900">
                Дисклеймер
              </div>
              Информация на сайте носит информационный характер и основана на
              практике рассмотрения жалоб в ФАС России. Публикуемые материалы
              не являются индивидуальной юридической консультацией.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}