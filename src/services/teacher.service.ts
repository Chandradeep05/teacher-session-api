import { Teacher } from '../models/Teacher';
import { CreateTeacherInput } from '../validators/teacher.validator';

export const createTeacher = async (data: CreateTeacherInput) => {
  const teacher = await Teacher.create(data);
  return teacher;
};

export const findTeacherById = async (id: string) => {
  return Teacher.findById(id).lean();
};
