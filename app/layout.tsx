import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";
import { SITE_CONTACTS } from "@/lib/site-config";
import { isTenderHost } from "@/lib/tender-host";

export const metadata: Metadata = {
  title: "GOSZAKON — практика ФАС и защита интересов в закупках",
  description:
    "Практика ФАС, РНП, нарушения в закупках, аналитика закупочных споров, услуги для поставщиков и заказчиков, судебная защита и правовая помощь в закупках.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const tenderHost = isTenderHost(headerStore.get("host"));
  const navigation = [
    { title: "Главная", href: "/" },
    { title: "Практика ФАС", href: "/cases" },
    { title: "Нарушения", href: "/narusheniya" },
    { title: "РНП", href: "/rnp" },
    { title: "Аналитика", href: "/analitika" },
    { title: "Поставщикам", href: "/postavshikam/riski" },
    { title: "Услуги", href: "/uslugi" },
    { title: "Заказчикам", href: "/zakazchikam" },
    { title: "Судебная защита", href: "/sudebnaya-zashita-v-zakupkah" },
    { title: "О проекте", href: "/o-proekte" },
  ];

  const footerLinks = [
    {
      title: "Практика",
      links: [
        { title: "Практика ФАС", href: "/cases" },
        { title: "Нарушения", href: "/narusheniya" },
        { title: "РНП", href: "/rnp" },
        { title: "Аналитика", href: "/analitika" },
      ],
    },
        {
          title: "Услуги",
          links: [
            { title: "Услуги поставщикам", href: "/uslugi" },
            { title: "Поставщикам", href: "/postavshikam/riski" },
            { title: "Не платит заказчик", href: "/neoplata-po-goskontraktu" },
            { title: "Заказчикам", href: "/zakazchikam" },
            { title: "Судебная защита", href: "/sudebnaya-zashita-v-zakupkah" },
            { title: "О проекте", href: "/o-proekte" },
          ],
    },
  ];

  return (
    <html lang="ru">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {tenderHost ? (
          <div className="min-h-screen bg-slate-100">{children}</div>
        ) : (
          <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {
                    if (document.scripts[j].src === r) { return; }
                  }
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],
                  k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=107419495", "ym");

              ym(107419495, "init", {
                ssr:true,
                webvisor:true,
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true
              });
            `,
          }}
        />

        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/107419495"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex items-center justify-between gap-6 py-5">
                <Link href="/" className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#081a4b] text-base font-bold text-white">
                    GZ
                  </div>

                  <div className="min-w-0">
                    <div className="text-3xl font-bold tracking-tight text-[#081a4b]">
                      GOSZAKON
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Правовая помощь в закупках
                    </div>
                  </div>
                </Link>

                <div className="hidden items-center gap-5 xl:flex">
                  <div className="text-right">
                    <a
                      href={SITE_CONTACTS.phoneHref}
                      className="whitespace-nowrap text-2xl font-bold tracking-tight text-[#081a4b] transition hover:opacity-80"
                    >
                      {SITE_CONTACTS.phoneDisplay}
                    </a>

                    <div className="mt-1 text-sm text-slate-500">
                      <a
                        href={SITE_CONTACTS.emailHref}
                        className="transition hover:text-[#081a4b]"
                      >
                        {SITE_CONTACTS.email}
                      </a>
                    </div>

                  </div>

                  <Link
                    href="/cases"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-[#081a4b] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#0d2568]"
                  >
                    Практика ФАС
                  </Link>
                </div>
              </div>

              <div className="hidden border-t border-slate-100 xl:block">
                <nav className="flex flex-wrap justify-center gap-x-10 gap-y-3 py-5">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-[15px] font-medium text-slate-700 transition hover:text-[#081a4b]"
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="border-t border-slate-100 xl:hidden">
                <div className="flex gap-5 overflow-x-auto py-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="whitespace-nowrap text-sm font-medium text-slate-700"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pb-4">
                  <a
                    href={SITE_CONTACTS.phoneHref}
                    className="whitespace-nowrap text-lg font-bold text-[#081a4b]"
                  >
                    {SITE_CONTACTS.phoneDisplay}
                  </a>

                  <a
                    href={SITE_CONTACTS.emailHref}
                    className="text-sm font-medium text-slate-700"
                  >
                    {SITE_CONTACTS.email}
                  </a>

                  <Link
                    href="/cases"
                    className="rounded-2xl bg-[#081a4b] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Практика ФАС
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-7xl px-6 py-16">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#081a4b] text-sm font-bold text-white">
                      GZ
                    </div>
                    <div>
                      <div className="text-lg font-bold tracking-tight text-[#081a4b]">
                        GOSZAKON
                      </div>
                      <div className="text-xs text-slate-500">
                        Правовая помощь в закупках
                      </div>
                    </div>
                  </Link>

                  <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700">
                    Экспертный сайт о практике ФАС, РНП, нарушениях в закупках,
                    аналитике закупочных споров, судебной защите и правовой помощи
                    поставщикам и заказчикам.
                  </p>

                  <div className="mt-4 text-sm font-medium text-slate-500">
                    Практика ФАС • Нарушения • РНП • Аналитика • Судебная защита
                  </div>

                  <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Контакты
                    </div>

                    <a
                      href={SITE_CONTACTS.phoneHref}
                      className="mt-3 block text-2xl font-bold tracking-tight text-[#081a4b]"
                    >
                      {SITE_CONTACTS.phoneDisplay}
                    </a>

                    <a
                      href={SITE_CONTACTS.emailHref}
                      className="mt-3 block text-base font-medium text-slate-700 transition hover:text-[#081a4b]"
                    >
                      {SITE_CONTACTS.email}
                    </a>

                    <div className="mt-3 text-sm text-slate-500">
                      Для связи используйте телефон или электронную почту.
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                      Работаем по всей России: подключаемся онлайн, выезжаем к
                      клиенту и при необходимости обучаем команду заказчика или
                      поставщика.
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-3">
                  {footerLinks.map((group) => (
                    <div key={group.title}>
                      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {group.title}
                      </div>

                      <div className="mt-4 flex flex-col gap-3">
                        {group.links.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm leading-7 text-slate-700 transition hover:text-[#081a4b]"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Связь
                    </div>

                    <div className="mt-4 flex flex-col gap-3 text-sm leading-7 text-slate-700">
                      <a
                        href={SITE_CONTACTS.phoneHref}
                        className="transition hover:text-[#081a4b]"
                      >
                        {SITE_CONTACTS.phoneDisplay}
                      </a>
                      <a
                        href={SITE_CONTACTS.emailHref}
                        className="transition hover:text-[#081a4b]"
                      >
                        {SITE_CONTACTS.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
                © {new Date().getFullYear()} GOSZAKON. Практика ФАС и защита
                интересов в закупках. При использовании материалов сайта активная
                ссылка на источник обязательна.
              </div>
            </div>
          </footer>
        </div>
          </>
        )}
      </body>
    </html>
  );
}
