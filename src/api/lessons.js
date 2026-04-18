import client from './client';

export const getQuestions   = (lessonId)        => client.get(`/lessons/${lessonId}/questions`);
export const createLesson   = (courseId, data) => client.post(`/courses/${courseId}/lessons`, data);
export const updateLesson   = (id, data)        => client.put(`/lessons/${id}`, data);
export const deleteLesson   = (id)              => client.delete(`/lessons/${id}`);

export const createQuestions = (lessonId, data) => client.post(`/lessons/${lessonId}/questions`, data);
export const replaceQuestions = (lessonId, data) => client.put(`/lessons/${lessonId}/questions`, data);

export const watchLesson    = (lessonId)        => client.post(`/lessons/${lessonId}/watch`);
export const submitTest     = (lessonId, data)  => client.post(`/lessons/${lessonId}/submit`, data);
