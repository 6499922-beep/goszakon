import { redirect } from "next/navigation";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { tenderUserRoleLabels } from "@/lib/tender-users";

export const dynamic = "force-dynamic";

function maskConfigPreview(configText: string) {
  return configText
    .split("\n")
    .map((line) => (line.startsWith("PrivateKey = ") ? "PrivateKey = ********" : line))
    .join("\n");
}

export default async function TenderVpnPage() {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "vpn_access")) {
    redirect("/");
  }

  const prisma = getPrisma();
  const ownProfile = await prisma.tenderVpnProfile.findUnique({
    where: { adminId: currentUser.id },
  });

  const users =
    tenderHasCapability(currentUser.role, "vpn_manage")
      ? await prisma.admin.findMany({
          orderBy: [{ role: "asc" }, { createdAt: "asc" }],
          include: {
            vpnProfile: true,
          },
        })
      : [];

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Личный доступ
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
              VPN-кабинет
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Здесь сотрудник может скачать свой WireGuard-конфиг и подключаться через
              стабильный серверный IP. Доступ к профилю привязан к рабочей учётке.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Вошёл как: <span className="font-semibold text-[#081a4b]">{currentUser.name ?? currentUser.email}</span>
            <br />
            Роль: <span className="font-semibold text-[#081a4b]">{tenderUserRoleLabels[currentUser.role]}</span>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Мой профиль
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
          Личный WireGuard-конфиг
        </h2>

        {ownProfile ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-lg font-semibold text-[#081a4b]">{ownProfile.label}</div>
              <div className="mt-3 grid gap-3 text-sm text-slate-600">
                <div>
                  Сервер: <span className="font-semibold text-[#081a4b]">{ownProfile.endpoint}</span>
                </div>
                <div>
                  Внутренний IP: <span className="font-semibold text-[#081a4b]">{ownProfile.clientAddress}</span>
                </div>
                <div>
                  Статус:{" "}
                  <span className={ownProfile.isActive ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                    {ownProfile.isActive ? "Активен" : "Выключен"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/api/tender/vpn/config"
                  className="rounded-2xl bg-[#081a4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2568]"
                >
                  Скачать мой .conf
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
                Предпросмотр
              </div>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-white p-4 text-xs leading-6 text-slate-700">
                {maskConfigPreview(ownProfile.configText)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            Для этой учётки VPN-профиль ещё не подготовлен. После выдачи профиля здесь
            появится кнопка скачивания.
          </div>
        )}
      </section>

      {users.length > 0 ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Администрирование
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">
            Профили сотрудников
          </h2>

          <div className="mt-6 grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-[#081a4b]">
                      {user.name ?? user.email}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{user.email}</div>
                  </div>

                  <div className="text-right">
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {tenderUserRoleLabels[user.role]}
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {user.vpnProfile ? (
                        user.vpnProfile.isActive ? "VPN-профиль активен" : "VPN-профиль выключен"
                      ) : (
                        "VPN-профиля пока нет"
                      )}
                    </div>
                  </div>
                </div>

                {user.vpnProfile ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span>
                      IP: <span className="font-semibold text-[#081a4b]">{user.vpnProfile.clientAddress}</span>
                    </span>
                    <span>
                      Сервер: <span className="font-semibold text-[#081a4b]">{user.vpnProfile.endpoint}</span>
                    </span>
                    <a
                      href={`/api/tender/vpn/config/${user.id}`}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Скачать .conf
                    </a>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
