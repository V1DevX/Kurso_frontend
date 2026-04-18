import client from './client';

export const getStats   = ()                      => client.get('/admin/stats');
export const getUsers   = (params)                => client.get('/admin/users', { params });
export const banUser    = (id, data)              => client.put(`/admin/users/${id}/ban`, data);
export const unbanUser  = (id)                    => client.put(`/admin/users/${id}/unban`);
export const changeRole = (id, role)              => client.put(`/admin/users/${id}/role`, { role });
