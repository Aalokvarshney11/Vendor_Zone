"use client";

import { useEffect, useState } from "react";
import { getUsers, createUser, updateUserRole, deleteUser } from "@/lib/api";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Users, Shield, Store, UserCheck, Trash2, RefreshCw, Search, UserPlus } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  // Updating role state
  const [updatingId, setUpdatingId] = useState(null);
  
  // Create user modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "officer",
  });
  
  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      const list = Array.isArray(data) ? data : data.users || [];
      setUsers(list);
    } catch (err) {
      setError(err.message || "Failed to load platform users.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError("Please fill in all required fields.");
      return;
    }
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      await createUser(newUser);
      setSuccess(`${newUser.role === "officer" ? "Municipal Officer" : newUser.role === "admin" ? "Administrator" : "Vendor"} account created successfully!`);
      setCreateModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "officer" });
      await loadUsers();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to create user account.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setUpdatingId(userId);
    setError("");
    setSuccess("");
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId || u.id === userId ? { ...u, role: newRole } : u))
      );
      setSuccess(`User role updated to ${newRole} successfully.`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  }

  function confirmDelete(user) {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  }

  async function handleDelete() {
    if (!userToDelete) return;
    setDeleting(true);
    setError("");
    setSuccess("");
    const targetId = userToDelete._id || userToDelete.id;
    try {
      await deleteUser(targetId);
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== targetId));
      setSuccess(`User account deleted successfully.`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  }

  const counts = {
    total: users.length,
    vendor: users.filter((u) => (u.role || "vendor").toLowerCase() === "vendor").length,
    officer: users.filter((u) => (u.role || "").toLowerCase() === "officer").length,
    admin: users.filter((u) => (u.role || "").toLowerCase() === "admin").length,
  };

  const filteredUsers = users.filter((u) => {
    const role = (u.role || "vendor").toLowerCase();
    const matchesRole = roleFilter === "all" ? true : role === roleFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);

    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            User Account Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory and role access control of all registered street vendors, municipal officers, and administrators
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Officer / User
          </Button>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{counts.total}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendors</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{counts.vendor}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Officers</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-700">{counts.officer}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admins</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-purple-700">{counts.admin}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Roles ({counts.total})</option>
            <option value="vendor">Vendors ({counts.vendor})</option>
            <option value="officer">Municipal Officers ({counts.officer})</option>
            <option value="admin">Administrators ({counts.admin})</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
          {success}
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500">
              No users found matching your criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User Details</th>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Registration Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u, idx) => {
                  const uid = u._id || u.id;
                  const isUpdating = updatingId === uid;
                  return (
                    <tr key={uid || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{u.name || "Unnamed Account"}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          ID: {uid || `USR-${idx + 100}`}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-800 font-medium">
                        {u.email}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role || "vendor"}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(uid, e.target.value)}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-all ${
                              u.role === "admin"
                                ? "bg-purple-50 text-purple-800 border-purple-200 focus:ring-purple-500"
                                : u.role === "officer"
                                ? "bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-500"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200 focus:ring-emerald-500"
                            }`}
                          >
                            <option value="vendor">Vendor</option>
                            <option value="officer">Municipal Officer</option>
                            <option value="admin">Administrator</option>
                          </select>
                          {isUpdating && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        }) : "Active"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => confirmDelete(u)}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision Municipal Officer / Staff Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            id="new-name"
            placeholder="e.g. Officer Vikram Sharma"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            id="new-email"
            type="email"
            placeholder="officer@municipal.gov.in"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />

          <Input
            label="Temporary Password"
            id="new-password"
            type="password"
            placeholder="At least 6 characters"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
              Assigned Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="officer">Municipal Officer (Zone & Permit Reviewer)</option>
              <option value="admin">System Administrator</option>
              <option value="vendor">Street Vendor</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={creating}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm User Account Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete the account for{" "}
            <strong className="text-slate-900">{userToDelete?.name}</strong> ({userToDelete?.email})?
            This will also remove any linked vendor profile and cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
