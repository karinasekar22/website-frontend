import Panel, { PanelHeading } from '../components/ui/Panel'
import { PageTitle } from '../components/layout/Topbar'

export default function SettingsPage() {
  return (
    <>
      <PageTitle title="Pengaturan" />

      <Panel>
        <PanelHeading
          title="Pengaturan"
          subtitle="Kelola preferensi aplikasi sekolah"
        />

        <div className="settings-grid">
          <div>
            <b>Profil sekolah</b>
            <p>
              Informasi identitas dan konfigurasi sekolah.
            </p>
          </div>

          <div>
            <b>Notifikasi</b>
            <p>
              Atur pemberitahuan aktivitas akademik.
            </p>
          </div>

          <div>
            <b>Role & akses</b>
            <p>
              Atur hak akses administrator, guru, dan siswa.
            </p>
          </div>
        </div>
      </Panel>
    </>
  )
}