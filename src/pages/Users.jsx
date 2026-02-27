import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (error) {
      console.log(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 bg-size-[200%_100%]"
          >
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          User Management
        </h2>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Role</th>
                {user.role === "ADMIN" && (
                  <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {users.map((u) => {
                const isDisabled = user.id === u.id;

                return (
                  <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 text-gray-700">{u.name}</td>
                    <td className="p-3 text-gray-700">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          u.role === "ADMIN"
                            ? "bg-green-100 text-green-600"
                            : u.role === "MANAGER"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {user.role === "ADMIN" && (
                      <td className="p-3">
                        <Select
                          value={u.role}
                          onValueChange={(value) => handleRoleChange(u.id, value)}
                          disabled={isDisabled}
                        >
                          <SelectTrigger
                            className={`w-full border rounded-lg px-3 py-2 text-sm ${
                              isDisabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"
                            }`}
                          >
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            <SelectGroup>
                              <SelectLabel>Roles</SelectLabel>
                              <SelectItem value="USER">USER</SelectItem>
                              <SelectItem value="MANAGER">MANAGER</SelectItem>
                              <SelectItem value="ADMIN">ADMIN</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center text-gray-500 py-6">No users found.</div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {users.map((u) => {
            const isDisabled = user.id === u.id;

            return (
              <div key={u.id} className="bg-slate-50 rounded-xl p-4 shadow-sm">
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium wrap-break-word">{u.name}</p>
                </div>

                <div className="mb-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium wrap-break-word">{u.email}</p>
                </div>

                <div className="mb-2">
                  <p className="text-sm text-gray-500">Role</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      u.role === "ADMIN"
                        ? "bg-green-100 text-green-600"
                        : u.role === "MANAGER"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                {user.role === "ADMIN" && (
                  <div className="mt-3">
                    <Select
                      value={u.role}
                      onValueChange={(value) => handleRoleChange(u.id, value)}
                      disabled={isDisabled}
                    >
                      <SelectTrigger
                        className={`w-full border rounded-lg px-3 py-2 text-sm ${
                          isDisabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"
                        }`}
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          <SelectItem value="USER">USER</SelectItem>
                          <SelectItem value="MANAGER">MANAGER</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Users;