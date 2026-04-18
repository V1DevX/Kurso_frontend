import client from './client';

export const getCourses    = (params) => client.get('/courses', { params });
export const getCourse     = (id)     => client.get(`/courses/${id}`);
export const createCourse  = (data)   => client.post('/courses', data);
export const updateCourse  = (id, data) => client.put(`/courses/${id}`, data);
export const deleteCourse  = (id)     => client.delete(`/courses/${id}`);

export const enrollCourse  = (id)     => client.post(`/courses/${id}/enroll`);
export const getStudents   = (id)     => client.get(`/courses/${id}/students`);
export const kickStudent   = (id, userId) => client.delete(`/courses/${id}/students/${userId}`);
export const approveRequest = (id, userId) => client.put(`/courses/${id}/requests/${userId}/approve`);
export const rejectRequest  = (id, userId) => client.put(`/courses/${id}/requests/${userId}/reject`);

export const getLessons    = (courseId)       => client.get(`/courses/${courseId}/lessons`);
export const getCourseProgress = (courseId)   => client.get(`/courses/${courseId}/progress`);

export const getReviews    = (id)       => client.get(`/courses/${id}/reviews`);
export const createReview  = (id, data) => client.post(`/courses/${id}/reviews`, data);
