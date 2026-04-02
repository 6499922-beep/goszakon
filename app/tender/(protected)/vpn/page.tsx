import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getCurrentTenderUser } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";
import { tenderHasCapability } from "@/lib/tender-permissions";
import { tenderUserRoleLabels } from "@/lib/tender-users";

export const dynamic = "force-dynamic";

async function buildQrDataUrl(configText: string) {
  return QRCode.toDataURL(configText, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
  });
}

export default async function TenderVpnPage() {
  const currentUser = await getCurrentTenderUser();

  if (!currentUser || !tenderHasCapability(currentUser.role, "vpn_manage")) {
    redirect("/");
  }

  const prisma = getPrisma();
  const users = await prisma.admin.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    include: {
      vpnProfile: true,
    },
  });

  const now = Date.now();
  const usersWithQr = await Promise.all(
    users.map(async (user) => ({
      ...user,
      vpnQr: user.vpnProfile ? await buildQrDataUrl(user.vpnProfile.configText) : null,
      isConnected:
        user.vpnProfile?.lastHandshakeAt
          ? now - new Date(user.vpnProfile.lastHandshakeAt).getTime() < 3 * 60 * 1000
          : false,
    }))
  );

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">Администрирование</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#081a4b]">
              VPN для сотрудников
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Здесь ты выдаёшь сотруднику готовый QR-код WireGuard. Сотруднику не нужен
              отдельный вход в кабинет: он просто сканирует код и подключается. Ниже
              видно, у кого профиль активен и кто недавно был в сети.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Вошёл как: <span className="font-semibold text-[#081a4b]">{currentUser.name ?? currentUser.email}</span>
            <br />
            Роль: <span className="font-semibold text-[#081a4b]">{tenderUserRoleLabels[currentUser.role]}</span>
          </div>
        </div>
      </section>

      {users.length > 0 ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">Профили</div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#081a4b]">Сотрудники и QR-доступ</h2>

          <div className="mt-6 grid gap-4">
            {usersWithQr.map((user) => (
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
                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span>
                        IP: <span className="font-semibold text-[#081a4b]">{user.vpnProfile.clientAddress}</span>
                      </span>
                      <span>
                        Сервер: <span className="font-semibold text-[#081a4b]">{user.vpnProfile.endpoint}</span>
                      </span>
                      <span className={user.isConnected ? "font-semibold text-emerald-700" : "font-semibold text-slate-500"}>
                        {user.isConnected ? "Сейчас подключен" : "Сейчас не подключен"}
                      </span>
                      {user.vpnProfile.lastHandshakeAt ? (
                        <span>
                          Последний handshake:{" "}
                          <span className="font-semibold text-[#081a4b]">
                            {new Date(user.vpnProfile.lastHandshakeAt).toLocaleString("ru-RU")}
                          </span>
                        </span>
                      ) : null}
                      {user.vpnProfile.lastEndpoint ? (
                        <span>
                          Endpoint клиента:{" "}
                          <span className="font-semibold text-[#081a4b]">{user.vpnProfile.lastEndpoint}</span>
                        </span>
                      ) : null}
                      <a
                        href={`/api/tender/vpn/config/${user.id}`}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Скачать .conf
                      </a>
                    </div>

                    <div className="rounded-2xl bg-white p-3">
                      {user.vpnQr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.vpnQr}
                          alt={`QR для ${user.name ?? user.email}`}
                          className="h-[196px] w-[196px] rounded-xl border border-slate-200"
                        />
                      ) : null}
                      <div className="mt-3 text-center text-xs leading-5 text-slate-500">
                        Сотрудник открывает WireGuard, сканирует QR и сразу подключается.
                      </div>
                    </div>
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
