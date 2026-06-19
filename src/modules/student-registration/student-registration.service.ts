import prisma from '../../config/prisma.js';

type RegistrationInput = {
  idStudent: number;
  idGroup: number;
  idSubject: number;
  schoolYear: string;
};

export const create = async (data: { registrations: RegistrationInput[] }) => {
  const results = [];

  for (const reg of data.registrations) {
    const created = await prisma.studentOnSubjectOnGroup.create({
      data: {
        idStudent: reg.idStudent,
        idGroup: reg.idGroup,
        idSubject: reg.idSubject,
        schoolYear: reg.schoolYear,
      },
    });

    results.push(created);
  }

  return results;
};
