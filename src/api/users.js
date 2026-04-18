import client from './client';

export const getMe         = ()          => client.get('/users/me');
export const updateMe      = (data)      => client.put('/users/me', data);
export const getMyCourses  = ()          => client.get('/users/me/courses');
export const getUserById   = (id)        => client.get(`/users/${id}`);
export const getLeaderboard = ()         => client.get('/leaderboard');

export const becomeAuthor   = ()           => client.post('/users/me/become-author');

export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append('avatar', file);
  return client.post('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
