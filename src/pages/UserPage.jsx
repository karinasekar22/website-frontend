import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Plus,
  X,
  Filter,
  Users,
  UserCheck,
  UserRound,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import Swal from "sweetalert2";

import { addUser, getAllUsers } from "../services/userService";
import Panel, { PanelHeading } from "../components/ui/Panel";
import StatusBadge from "../components/ui/StatusBadge";
import { PageTitle } from "../components/layout/Topbar";
import "../styles/user.css";

const EMPTY_FILTERS = {
  namaLengkap: "",
  nomorInduk: "",
  email: "",
  role: "",
  status: "",
  orderBy: "namaLengkap",
  pageSize: 10,
};

const EMPTY_USER = {
  namaLengkap: "",
  nomorInduk: "",
  email: "",
  role: "",
  tanggalLahir: "",
  angkatan: "",
};

const ROLE_OPTIONS = ["GURU", "ADMIN", "WALIKELAS"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

const ORDER_OPTIONS = [
  { value: "namaLengkap", label: "Nama Lengkap" },
  { value: "nomorInduk", label: "Nomor Induk" },
  { value: "email", label: "Email" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const FILTER_LABELS = {
  namaLengkap: "Nama",
  nomorInduk: "No. Induk",
  email: "Email",
  role: "Role",
  status: "Status",
};

const getInitials = (name) =>
  (name || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getStatusType = (status) =>
  status?.toUpperCase() === "ACTIVE" ? "hadir" : "izin";

const todayISO = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toDDMMYYYY = (isoDate) => {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
};

const getRoleClass = (role) => {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "user-role-admin";
    case "GURU":
      return "user-role-guru";
    case "WALIKELAS":
      return "user-role-walikelas";
    default:
      return "user-role-default";
  }
};

function EmptyRow({ children }) {
  return (
    <tr>
      <td colSpan={5} className="up-empty">
        <div className="user-empty-state">
          <div className="user-empty-icon">
            <Users size={23} />
          </div>
          <strong>{children}</strong>
          <span>Data user akan ditampilkan di tabel ini.</span>
        </div>
      </td>
    </tr>
  );
}

function ModalShell({
  title,
  description,
  icon: Icon,
  onClose,
  onSubmit,
  footer,
  children,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="up-overlay" onMouseDown={onClose}>
      <form
        className="up-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="user-modal-heading">
          <div className="user-modal-heading-main">
            <div className="user-modal-icon">
              <Icon size={22} />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </div>

          <button
            type="button"
            className="up-icon-button"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {children}

        <div className="up-modal-footer">{footer}</div>
      </form>
    </div>
  );
}

function FilterModal({ initialValues, loading, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({ ...initialValues }));

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setForm({ ...EMPTY_FILTERS });
  };

  return (
    <ModalShell
      title="Filter User"
      description="Atur kriteria untuk menyaring data user."
      icon={Filter}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
      footer={
        <>
          <button
            type="button"
            className="user-button user-button-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="user-button user-button-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="up-spin" />
                Memuat...
              </>
            ) : (
              <>
                <Filter size={15} />
                Terapkan Filter
              </>
            )}
          </button>
        </>
      }
    >
      <div className="up-modal-body">
        <label className="up-field up-field-full">
          <span>Nama Lengkap</span>
          <input
            name="namaLengkap"
            value={form.namaLengkap}
            onChange={handleChange}
            placeholder="Cari nama lengkap"
            autoFocus
          />
        </label>

        <label className="up-field">
          <span>Nomor Induk</span>
          <input
            name="nomorInduk"
            value={form.nomorInduk}
            onChange={handleChange}
            placeholder="Masukkan nomor induk"
          />
        </label>

        <label className="up-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="nama@email.com"
          />
        </label>

        <label className="up-field">
          <span>Role</span>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="">Semua role</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <label className="up-field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="">Semua status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
              </option>
            ))}
          </select>
        </label>

        <label className="up-field">
          <span>Urutkan berdasarkan</span>
          <select name="orderBy" value={form.orderBy} onChange={handleChange}>
            {ORDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="up-field">
          <span>Jumlah data per halaman</span>
          <select name="pageSize" value={form.pageSize} onChange={handleChange}>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} data
              </option>
            ))}
          </select>
        </label>
      </div>
    </ModalShell>
  );
}

function AddUserModal({ saving, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_USER }));

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      nomorInduk: form.nomorInduk.trim(),
      namaLengkap: form.namaLengkap.trim(),
      email: form.email.trim(),
      role: form.role,
    };

    if (form.tanggalLahir) {
      payload.tanggalLahir = toDDMMYYYY(form.tanggalLahir);
    }

    if (form.angkatan.trim()) {
      payload.angkatan = form.angkatan.trim();
    }

    onSubmit(payload);
  };

  return (
    <ModalShell
      title="Tambah User"
      description="Lengkapi informasi akun yang akan ditambahkan."
      icon={UserRound}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button
            type="button"
            className="user-button user-button-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </button>
          <button
            type="submit"
            className="user-button user-button-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={15} className="up-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Plus size={16} />
                Simpan User
              </>
            )}
          </button>
        </>
      }
    >
      <div className="user-form-intro">
        <ShieldCheck size={17} />
        <span>
          Kolom bertanda <b>*</b> wajib diisi.
        </span>
      </div>

      <div className="up-modal-body">
        <label className="up-field up-field-full">
          <span>
            Nama Lengkap <b>*</b>
          </span>
          <input
            name="namaLengkap"
            value={form.namaLengkap}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            autoComplete="name"
            required
            autoFocus
          />
        </label>

        <label className="up-field">
          <span>
            Nomor Induk <b>*</b>
          </span>
          <input
            name="nomorInduk"
            value={form.nomorInduk}
            onChange={handleChange}
            placeholder="Masukkan nomor induk"
            required
          />
        </label>

        <label className="up-field">
          <span>
            Email <b>*</b>
          </span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="nama@email.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="up-field up-field-full">
          <span>
            Role <b>*</b>
          </span>
          <div className="user-select-wrap">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="">Pilih role user</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <small>Role menentukan akses user di dalam aplikasi.</small>
        </label>

        <label className="up-field">
          <span>Tanggal Lahir</span>
          <input
            type="date"
            name="tanggalLahir"
            value={form.tanggalLahir}
            onChange={handleChange}
            max={todayISO()}
          />
        </label>

        <label className="up-field">
          <span>Angkatan</span>
          <input
            name="angkatan"
            value={form.angkatan}
            onChange={handleChange}
            placeholder="Contoh: 2024"
            inputMode="numeric"
          />
        </label>
      </div>
    </ModalShell>
  );
}

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS }));
  const [activeModal, setActiveModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async (params) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        pageNum: 1,
        pageSize: Number(params.pageSize) || 10,
        orderBy: params.orderBy || "namaLengkap",
        status: params.status || "",
        namaLengkap: params.namaLengkap.trim(),
        nomorInduk: params.nomorInduk.trim(),
        role: params.role ? [params.role] : [],
        email: params.email.trim(),
      };

      const response = await getAllUsers(payload);
      const result = response?.data;

      if (!Array.isArray(result?.items)) {
        throw new Error("Format respons daftar user tidak valid.");
      }

      setUsers(result.items);
    } catch (err) {
      setError(err.message || "Gagal mengambil data user.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers({ ...EMPTY_FILTERS });
  }, [fetchUsers]);

  const closeModal = useCallback(() => setActiveModal(null), []);

  const applyFilters = async (nextFilters) => {
    const normalizedFilters = {
      ...nextFilters,
      pageSize: Number(nextFilters.pageSize) || 10,
    };

    setFilters(normalizedFilters);
    setActiveModal(null);
    await fetchUsers(normalizedFilters);
  };

  const removeFilter = (key) => {
    const nextFilters = { ...filters, [key]: "" };
    setFilters(nextFilters);
    fetchUsers(nextFilters);
  };

  const clearFilters = () => {
    const nextFilters = { ...EMPTY_FILTERS };
    setFilters(nextFilters);
    fetchUsers(nextFilters);
  };

  const handleAddUser = async (payload) => {
    setSaving(true);

    try {
      await addUser(payload);
      setActiveModal(null);

      await Swal.fire({
        icon: "success",
        title: "User berhasil ditambahkan",
        text: "Data user baru sudah tersimpan.",
        timer: 2000,
        showConfirmButton: false,
      });

      await fetchUsers(filters);
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menambahkan user",
        text: err.message || "Terjadi kesalahan, silakan coba lagi.",
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSaving(false);
    }
  };

  const activeFilters = Object.keys(FILTER_LABELS).filter(
    (key) => filters[key],
  );

  const activeCount = users.filter(
    (user) => user.status?.toUpperCase() === "ACTIVE",
  ).length;

  const inactiveCount = users.filter(
    (user) => user.status?.toUpperCase() === "INACTIVE",
  ).length;

  const renderTableBody = () => {
    if (loading && users.length === 0) {
      return <EmptyRow>Memuat data user...</EmptyRow>;
    }

    if (error && users.length === 0) {
      return <EmptyRow>Data user gagal dimuat.</EmptyRow>;
    }

    if (users.length === 0) {
      return <EmptyRow>Belum ada data user.</EmptyRow>;
    }

    return users.map((user, index) => (
      <tr key={user.idUser ?? user.id ?? `${user.email}-${index}`}>
        <td>
          <div className="user-person-cell">
            <div className="user-avatar">{getInitials(user.namaLengkap)}</div>
            <div className="user-person-info">
              <strong>{user.namaLengkap || "-"}</strong>
              <span>Nomor induk: {user.nomorInduk || "-"}</span>
            </div>
          </div>
        </td>

        <td>
          <span className="user-email">{user.email || "-"}</span>
        </td>

        <td>
          <span className={`user-role-badge ${getRoleClass(user.role)}`}>
            <ShieldCheck size={13} />
            {user.role || "Tidak ada role"}
          </span>
        </td>

        <td>
          <StatusBadge type={getStatusType(user.status)}>
            {user.status === "ACTIVE"
              ? "Aktif"
              : user.status === "INACTIVE"
                ? "Tidak Aktif"
                : user.status || "UNKNOWN"}
          </StatusBadge>
        </td>
      </tr>
    ));
  };

  return (
    <div className="user-page">
      <PageTitle title="Data User" />

      <div className="user-summary-grid">
        <div className="user-summary-card">
          <div className="user-summary-icon user-summary-icon-blue">
            <Users size={23} />
          </div>
          <div className="user-summary-content">
            <span>Data ditampilkan</span>
            <strong>{users.length}</strong>
            <small>User pada hasil saat ini</small>
          </div>
        </div>

        <div className="user-summary-card">
          <div className="user-summary-icon user-summary-icon-green">
            <UserCheck size={23} />
          </div>
          <div className="user-summary-content">
            <span>Status aktif</span>
            <strong>{activeCount}</strong>
            <small>User dengan status aktif</small>
          </div>
        </div>

        <div className="user-summary-card">
          <div className="user-summary-icon user-summary-icon-purple">
            <ShieldCheck size={23} />
          </div>
          <div className="user-summary-content">
            <span>Role tersedia</span>
            <strong>{ROLE_OPTIONS.length}</strong>
            <small>Admin, guru, dan wali kelas</small>
          </div>
        </div>
      </div>

      <Panel>
        <PanelHeading
          title="Daftar User"
          subtitle="Kelola akun admin, guru, dan wali kelas."
          action={
            <div className="user-page-actions">
              <button
                type="button"
                className="user-button user-button-secondary"
                onClick={() => fetchUsers(filters)}
                disabled={loading}
              >
                <RefreshCw size={15} className={loading ? "up-spin" : ""} />
                Refresh
              </button>

              <button
                type="button"
                className="user-button user-button-secondary"
                onClick={() => setActiveModal("filter")}
              >
                <Filter size={15} />
                Filter
                {activeFilters.length > 0 && (
                  <span className="user-filter-count">
                    {activeFilters.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                className="user-button user-button-primary"
                onClick={() => setActiveModal("add")}
              >
                <Plus size={16} />
                Tambah User
              </button>
            </div>
          }
        />

        {error && (
          <div className="user-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchUsers(filters)}
              disabled={loading}
            >
              Coba lagi
            </button>
          </div>
        )}

        <div className="user-table-toolbar">
          <div>
            <strong>Semua user</strong>
            <span>
              {loading ? "Memuat data..." : `${users.length} data ditampilkan`}
            </span>
          </div>

          {activeFilters.length > 0 && (
            <button
              type="button"
              className="user-clear-filters"
              onClick={clearFilters}
            >
              <X size={14} />
              Hapus semua filter
            </button>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="up-toolbar">
            <div className="up-chips">
              {activeFilters.map((key) => (
                <span className="up-chip" key={key}>
                  {FILTER_LABELS[key]}: <b>{filters[key]}</b>
                  <button
                    type="button"
                    onClick={() => removeFilter(key)}
                    aria-label={`Hapus filter ${FILTER_LABELS[key]}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="table-wrap up-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Nama User</th>
                <th>Email</th>
                <th>Role / Akses</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>

        <div className="user-table-footer">
          <span>
            Menampilkan <strong>{users.length}</strong> data pada hasil saat ini
          </span>

          <button
            type="button"
            className="user-footer-refresh"
            onClick={() => fetchUsers(filters)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "up-spin" : ""} />
            Perbarui data
          </button>
        </div>
      </Panel>

      {activeModal === "filter" && (
        <FilterModal
          initialValues={filters}
          loading={loading}
          onClose={closeModal}
          onSubmit={applyFilters}
        />
      )}

      {activeModal === "add" && (
        <AddUserModal
          saving={saving}
          onClose={closeModal}
          onSubmit={handleAddUser}
        />
      )}
    </div>
  );
}
