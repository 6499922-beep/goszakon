export default function Home() {
  const stats = [
    { label: 'Заседаний ФАС в день', value: '5–7' },
    { label: 'Обоснованных жалоб в месяц', value: '20–30' },
    { label: 'Основной фокус', value: '223-ФЗ' },
    { label: 'Формат работы', value: 'Практика + сопровождение' },
  ];

  const services = [
    {
      title: 'Жалобы в ФАС',
      text: 'Подготовка и сопровождение жалоб по 223-ФЗ, анализ документации, участие в заседаниях и дальнейшее сопровождение позиции поставщика.',
    },
    {
      title: 'Проверка закупки',
      text: 'Проверка закупки по ссылке: выявление нарушений, оценка перспектив жалобы и рекомендации по дальнейшим действиям.',
    },
    {
      title: 'Судебная практика',
      text: 'Сопровождение споров после рассмотрения жалобы, взыскание расходов и защита интересов поставщика в суде.',
    },
    {
      title: 'Неоплата и взыскание',
      text: 'Работа с кейсами по неоплате, взысканию задолженности и защите поставщика на стадии исполнения договора.',
    },
  ];

  const cases = [
    {
      title: 'ФАС признал жалобу обоснованной из-за неправильного применения национального режима',
      meta: 'Закупка №32615636398 · Саратовская область',
      result: 'Жалоба признана обоснованной, закупка отменена.',
      tag: 'Национальный режим',
    },
    {
      title: 'Жалоба частично обоснована из-за указания товарного знака без эквивалента',
      meta: 'Закупка №32615662161 · Московская область',
      result: 'Установлено нарушение в документации, выдано предписание.',
      tag: 'Товарный знак',
    },
    {
      title: 'ФАС установил нарушение из-за неопределенного порядка исполнения заявок',
      meta: 'Закупка №32615667006 · Московская область',
      result: 'Жалоба частично обоснована, материалы переданы для административного реагирования.',
      tag: 'Процедурные нарушения',
    },
  ];

  const categories = [
    'Ограничение конкуренции',
    'Товарный знак без эквивалента',
    'Ошибки национального режима',
    'Неправильный ОКПД2',
    'Нарушения документации',
    'Нарушения процедуры',
    'Неоплата',
    'Судебная практика',
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-xl font-bold tracking-tight">GOSZAKON</div>
            <div className="text-sm text-slate-500">
              Портал практики жалоб в ФАС по 223-ФЗ
            </div>
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#practice" className="hover:text-slate-700">
              Практика ФАС
            </a>
            <a href="#services" className="hover:text-slate-700">
              Услуги
            </a>
            <a href="#request" className="hover:text-slate-700">
              Проверить закупку
            </a>
            <a href="#contacts" className="hover:text-slate-700">
              Контакты
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              Экспертный сервис для поставщиков и заказчиков
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Реальная практика жалоб в ФАС по 223-ФЗ, судебные кейсы и споры по
                неоплате.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Портал с базой кейсов, аналитикой нарушений и возможностью отправить
                закупку на проверку. Основа проекта — реальная ежедневная практика,
                а не общие статьи.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#request"
                className="rounded-2xl bg-slate-900 px-6 py-3 text-center text-sm font-medium text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5"
              >
                Проверить закупку
              </a>
              <a
                href="/cases"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-100"
              >
                Смотреть практику ФАС
              </a>
            </div>

            <p className="text-sm text-slate-500">
              При признании жалобы обоснованной расходы на юридическую помощь могут
              быть взысканы с заказчика.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200">
            <div className="mb-5 text-lg font-semibold">Ключевые показатели</div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-2xl font-bold tracking-tight">
                    {item.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">
                Чем занимается GOSZAKON
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                MVP строится вокруг практики: жалобы в ФАС, судебные споры и кейсы
                по неоплате.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" id="services">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="rounded-3xl border border-slate-200 p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {service.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="practice" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Практика ФАС</h2>
              <p className="mt-2 max-w-3xl text-slate-600">
                Каталог кейсов с привязкой к номеру закупки, типу нарушения,
                результату жалобы и приложенному решению ФАС.
              </p>
            </div>
            <a
              href="#request"
              className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              Отправить закупку на проверку
            </a>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
              >
                {category}
              </span>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {cases.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {item.tag}
                </div>
                <h3 className="text-lg font-semibold leading-7">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-500">{item.meta}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {item.result}
                </p>
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Жалоба подготовлена GOSZAKON
                  </span>
                  <a href="/cases" className="font-medium text-slate-800">
                    Открыть кейс
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2">
            <div className="space-y-5">
              <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-white/80">
                Для поставщиков и заказчиков
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Почему такой формат работает
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                Вместо обычного юридического лендинга портал показывает реальную
                практику: номера закупок, типовые нарушения, результаты жалоб,
                судебное продолжение и кейсы по взысканию.
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>
                  • Поставщики видят реальные выигранные жалобы и понимают
                  перспективу обращения.
                </li>
                <li>
                  • Заказчики могут использовать портал как ориентир для аудита
                  документации и снижения рисков.
                </li>
                <li>
                  • Каждый опубликованный кейс усиливает доверие и работает как
                  доказательство экспертизы.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
              <h3 className="text-2xl font-bold tracking-tight">
                Проверить закупку
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Отправьте ссылку на закупку и кратко опишите проблему. Эта форма —
                главный лидогенерирующий блок MVP.
              </p>

              <form
                className="mt-6 space-y-4"
                id="request"
                action="mailto:info@goszakon.ru"
                method="post"
                encType="text/plain"
              >
                <input
                  name="link"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 transition focus:border-slate-500"
                  placeholder="Ссылка на закупку"
                />
                <textarea
                  name="problem"
                  className="min-h-[120px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  placeholder="Кратко опишите проблему"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    name="phone"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                    placeholder="Телефон"
                  />
                  <input
                    name="email"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                    placeholder="Email"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Отправить на проверку
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold tracking-tight">Поставщикам</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Жалобы в ФАС, проверка закупки, сопровождение заседаний, судебная
                практика и взыскание расходов.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold tracking-tight">Заказчикам</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Аудит документации, защита по жалобам, анализ рисков и
                сопровождение спорных закупочных процедур.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer id="contacts" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-2">
          <div>
            <div className="text-xl font-bold tracking-tight">GOSZAKON</div>
            <div className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
              Экспертный портал по практике жалоб в ФАС по 223-ФЗ, судебным
              кейсам и спорам по неоплате.
            </div>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 md:justify-end">
            <div>Телефон: +7 (___) ___-__-__</div>
            <div>Email: info@goszakon.ru</div>
            <div>Telegram: @goszakon</div>
          </div>
        </div>
      </footer>
    </div>
  );
}