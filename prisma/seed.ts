import { PrismaClient } from "@prisma/client";
import { buildClassLabelFromAssignment } from "../src/utils/classLabel.js";
import { encryptCredential } from "../src/utils/credential-crypto.js";

const prisma = new PrismaClient();

/** Textos de tareas THEORY/PRACTICE según el nombre real de la asignatura. */
function normalizeSubjectName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type SubjectTaskCopy = {
  theoryTitle: string;
  theoryDescription: string;
  practiceTitle: string;
  practiceDescription: string;
};

function subjectTaskCopy(subjectName: string): SubjectTaskCopy {
  const n = normalizeSubjectName(subjectName);

  if (n.includes("ipe")) {
    return {
      theoryTitle: `Material IPE — ${subjectName}`,
      theoryDescription:
        "Orientación laboral, empleabilidad y competencias transversales del módulo (no contenido técnico de otras asignaturas).",
      practiceTitle: `Actividad IPE — ${subjectName}`,
      practiceDescription:
        "Elaborar un CV adaptado al sector del ciclo y un informe breve con ofertas de empleo reales consultadas.",
    };
  }

  if (n.includes("sostenibilidad")) {
    return {
      theoryTitle: `Temario sostenibilidad — ${subjectName}`,
      theoryDescription:
        "Criterios de sostenibilidad, economía circular y impacto ambiental en el ámbito productivo.",
      practiceTitle: `Caso práctico — ${subjectName}`,
      practiceDescription:
        "Analizar un caso real de empresa del sector aplicando medidas de sostenibilidad (informe corto).",
    };
  }

  if (n.includes("digitalizacion")) {
    return {
      theoryTitle: `Recursos digitalización — ${subjectName}`,
      theoryDescription:
        "Transformación digital, herramientas colaborativas y buenas prácticas en entornos productivos.",
      practiceTitle: `Ejercicio digitalización — ${subjectName}`,
      practiceDescription:
        "Documentar una pequeña mejora digital aplicable al taller o empresa de referencia del ciclo.",
    };
  }

  if (n.includes("ingles")) {
    return {
      theoryTitle: `English materials — ${subjectName}`,
      theoryDescription:
        "Vocabulary and reading comprehension for professional English in IT/telecom contexts.",
      practiceTitle: `Writing task — ${subjectName}`,
      practiceDescription:
        "Write a short professional email or technical description in English (150–200 words).",
    };
  }

  if (n.includes("proyecto intermodular") || n === "optativa") {
    return {
      theoryTitle: `Guía del proyecto — ${subjectName}`,
      theoryDescription:
        "Criterios de evaluación, entregables y calendario del proyecto intermodular u optativa.",
      practiceTitle: `Avance de proyecto — ${subjectName}`,
      practiceDescription:
        "Entregar memoria parcial o prototipo según las fases definidas por el tutor del proyecto.",
    };
  }

  if (
    n.includes("base de datos") ||
    n.includes("bases de datos") ||
    n.includes("gestion de bases") ||
    n.includes("gestores de bases de datos") ||
    n.includes("acceso a datos")
  ) {
    return {
      theoryTitle: `Apuntes BBDD — ${subjectName}`,
      theoryDescription:
        "Modelo relacional, SQL, normalización y operaciones con el gestor visto en el módulo.",
      practiceTitle: `Práctica SQL — ${subjectName}`,
      practiceDescription:
        "Diseñar el esquema solicitado y entregar el script SQL con consultas de ejemplo comentadas.",
    };
  }

  if (
    n.includes("desarrollo web") ||
    n.includes("despliegue de aplicaciones web") ||
    n.includes("diseño de interfaces") ||
    n.includes("desarrollo de interfaces") ||
    n.includes("aplicaciones web") ||
    n.includes("implantacion de aplicaciones web") ||
    n.includes("lenguaje de marcas")
  ) {
    return {
      theoryTitle: `Documentación web — ${subjectName}`,
      theoryDescription:
        "Apuntes de HTML, CSS, JavaScript o tecnologías del stack web del módulo.",
      practiceTitle: `Entrega web — ${subjectName}`,
      practiceDescription:
        "Completar la página o componente indicado en clase y publicar la URL o el repositorio.",
    };
  }

  if (n.includes("entornos de desarrollo")) {
    return {
      theoryTitle: `IDE y herramientas — ${subjectName}`,
      theoryDescription:
        "Configuración del entorno, depuración, control de versiones y flujo de trabajo del desarrollador.",
      practiceTitle: `Práctica entorno — ${subjectName}`,
      practiceDescription:
        "Configurar el proyecto base en el IDE y entregar capturas del depurador o del repositorio Git.",
    };
  }

  if (
    n.includes("programacion") ||
    n.includes("servicios y procesos") ||
    n.includes("multimedia y dispositivos")
  ) {
    return {
      theoryTitle: `Apuntes programación — ${subjectName}`,
      theoryDescription:
        "Sintaxis, estructuras de control, POO y patrones básicos del lenguaje usado en el módulo.",
      practiceTitle: `Ejercicios de código — ${subjectName}`,
      practiceDescription:
        "Implementar los ejercicios propuestos y subir el proyecto o ficheros fuente indicados.",
    };
  }

  if (
    n.includes("sistemas informaticos") ||
    n.includes("sistemas operativos") ||
    n.includes("implantacion de sistemas") ||
    n.includes("administracion de sistemas operativos")
  ) {
    return {
      theoryTitle: `Arquitectura y SO — ${subjectName}`,
      theoryDescription:
        "Hardware, sistemas operativos, virtualización o administración según el temario del módulo.",
      practiceTitle: `Práctica de sistemas — ${subjectName}`,
      practiceDescription:
        "Realizar la instalación, configuración o script de administración pedido en el enunciado.",
    };
  }

  if (
    n.includes("redes") ||
    n.includes("servicios de red") ||
    n.includes("servicios en red") ||
    n.includes("seguridad y alta disponibilidad") ||
    n.includes("seguridad informatica") ||
    n.includes("planificacion y administracion de redes")
  ) {
    return {
      theoryTitle: `Teoría de redes — ${subjectName}`,
      theoryDescription:
        "Topologías, protocolos, direccionamiento y servicios de red del temario.",
      practiceTitle: `Laboratorio de redes — ${subjectName}`,
      practiceDescription:
        "Configurar el escenario de red (Packet Tracer, GNS3 o equipos reales) y entregar evidencias.",
    };
  }

  if (
    n.includes("hardware") ||
    n.includes("montaje") ||
    n.includes("equipos microinformaticos") ||
    n.includes("ofimatica")
  ) {
    return {
      theoryTitle: `Material de taller — ${subjectName}`,
      theoryDescription:
        "Componentes, montaje, mantenimiento preventivo u ofimática según el módulo.",
      practiceTitle: `Ficha de práctica — ${subjectName}`,
      practiceDescription:
        "Completar el montaje, checklist o documento ofimático solicitado en el taller.",
    };
  }

  if (
    n.includes("electronica") ||
    n.includes("circuitos") ||
    n.includes("equipos programables") ||
    n.includes("mantenimiento electronico") ||
    n.includes("mantenimiento de equipos") ||
    n.includes("tecnicas y proceso de montaje")
  ) {
    return {
      theoryTitle: `Fundamentos electrónicos — ${subjectName}`,
      theoryDescription:
        "Componentes, mediciones, esquemas y normativa aplicable al módulo de electrónica.",
      practiceTitle: `Práctica de electrónica — ${subjectName}`,
      practiceDescription:
        "Montar o simular el circuito del enunciado y entregar esquema, fotos y mediciones.",
    };
  }

  if (
    n.includes("telecomunicacion") ||
    n.includes("telefonia") ||
    n.includes("domotica") ||
    n.includes("megafonia") ||
    n.includes("radiocomunicaciones") ||
    n.includes("circuito cerrado") ||
    n.includes("instalaciones electricas") ||
    n.includes("infraestructuras comunes") ||
    n.includes("infraestructuras de redes de datos")
  ) {
    return {
      theoryTitle: `Normativa e instalaciones — ${subjectName}`,
      theoryDescription:
        "Cableado, reglamentación, planos y criterios de instalación del ámbito telecomunicaciones.",
      practiceTitle: `Actuación en instalación — ${subjectName}`,
      practiceDescription:
        "Elaborar croquis, presupuesto simplificado o informe de la instalación práctica del módulo.",
    };
  }

  if (n.includes("gestion empresarial") || n.includes("erp")) {
    return {
      theoryTitle: `Sistemas ERP — ${subjectName}`,
      theoryDescription:
        "Procesos de negocio, módulos ERP y flujos administrativos del software estudiado.",
      practiceTitle: `Caso ERP — ${subjectName}`,
      practiceDescription:
        "Registrar las operaciones del caso práctico en el ERP y entregar capturas o exportación.",
    };
  }

  return {
    theoryTitle: `Temario — ${subjectName}`,
    theoryDescription: `Material de apoyo y documentación del módulo ${subjectName}.`,
    practiceTitle: `Práctica — ${subjectName}`,
    practiceDescription: `Actividad práctica y entregable correspondiente a ${subjectName}.`,
  };
}

/** Título y descripción de examen según la asignatura. */
function examTaskCopy(subjectName: string): { title: string; description: string } {
  const n = normalizeSubjectName(subjectName);

  if (n.includes("ipe")) {
    return {
      title: `Examen IPE — ${subjectName}`,
      description:
        "Prueba sobre orientación laboral, competencias transversales y preparación de entrevistas del módulo IPE.",
    };
  }
  if (n.includes("ingles")) {
    return {
      title: `Exam — ${subjectName}`,
      description:
        "Written test: professional vocabulary and short answers in English related to the module.",
    };
  }
  if (
    n.includes("base de datos") ||
    n.includes("bases de datos") ||
    n.includes("gestion de bases") ||
    n.includes("gestores de bases de datos") ||
    n.includes("acceso a datos")
  ) {
    return {
      title: `Examen BBDD — ${subjectName}`,
      description:
        "Examen parcial: modelo relacional, consultas SQL y normalización del temario de base de datos.",
    };
  }
  if (
    n.includes("programacion") ||
    n.includes("servicios y procesos") ||
    n.includes("multimedia y dispositivos") ||
    n.includes("desarrollo web") ||
    n.includes("entornos de desarrollo")
  ) {
    return {
      title: `Examen — ${subjectName}`,
      description:
        "Examen parcial de programación: ejercicios de código y preguntas teóricas del módulo.",
    };
  }
  if (
    n.includes("redes") ||
    n.includes("seguridad") ||
    n.includes("sistemas operativos") ||
    n.includes("servicios de red") ||
    n.includes("servicios en red")
  ) {
    return {
      title: `Examen — ${subjectName}`,
      description:
        "Examen parcial sobre configuración, protocolos y escenarios de red del temario.",
    };
  }
  if (
    n.includes("electronica") ||
    n.includes("circuitos") ||
    n.includes("telecomunicacion") ||
    n.includes("instalaciones")
  ) {
    return {
      title: `Examen — ${subjectName}`,
      description:
        "Examen parcial: esquemas, mediciones, normativa y criterios técnicos del módulo.",
    };
  }

  return {
    title: `Examen — ${subjectName}`,
    description: `Examen parcial del módulo ${subjectName}. Consultar temario y prácticas del curso.`,
  };
}

async function main() {
  console.log('🌱 Iniciando seed...');


  console.log('Limpiando datos existentes');
  // Hijos primero (orden por FKs del schema actual)
  await prisma.assistance.deleteMany();
  await prisma.studentTask.deleteMany();
  await prisma.subjectEvaluation.deleteMany();
  await prisma.assignmentSubstitution.deleteMany();
  await prisma.sessionClass.deleteMany();
  await prisma.task.deleteMany();
  await prisma.weekSchedule.deleteMany();
  await prisma.studentOnSubjectOnGroup.deleteMany();
  await prisma.teacherOnSubjectOnGroup.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.taskGroup.deleteMany();
  await prisma.group.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.studentPassword.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.admin.deleteMany();

  console.log('Reiniciando secuencias de IDs');
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Assistance_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "StudentTask_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "SessionClass_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Task_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "WeekSchedule_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "StudentOnSubjectOnGroup_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "TeacherOnSubjectOnGroup_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Notification_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "SubjectEvaluation_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "AssignmentSubstitution_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "StudentPassword_id_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Issue_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "TaskGroup_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Group_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Subject_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Course_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Student_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Teacher_id_seq" RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Admin_id_seq" RESTART WITH 1;`);


  const acaYear = "2024-2025";

  console.log('Creando estudiantes');

  // Crear Estudiantes
  const students = await
    prisma.student.createMany({
      data: [{
        email: 'estudiante1@ziryab.es',
        name: 'Juan',
        surname: 'García',
        ndSurname: 'López',
        birthDate: new Date('2005-03-15'),
        dni: '12345678A',
        firebaseUID: 'XXLBaX0HvKaTjxQ7cfRAgGaSZoo1'

      },
      {
        email: 'estudiante2@ziryab.es',
        name: 'María',
        surname: 'López',
        ndSurname: 'Martínez',
        birthDate: new Date('2005-07-22'),
        dni: '23456789B',
        firebaseUID: 'bsnnjoIoTfZuOglbywuEbBHWmQq1'

      },
      {
        email: 'estudiante3@ziryab.es',
        name: 'Carlos',
        surname: 'Rodríguez',
        ndSurname: 'Fernández',
        birthDate: new Date('2004-11-08'),
        dni: '34567890C',
        firebaseUID: 'PP4iok2CLedowxkFy57UNx9kIFm2'

      },
      {
        email: 'estudiante4@ziryab.es',
        name: 'Lucía',
        surname: 'Fernández',
        ndSurname: 'Sánchez',
        birthDate: new Date('2005-05-30'),
        dni: '45678901D',
        firebaseUID: '6OJrP6tFrnYal5PaDPIi73Qnzdu1'

      },
      {
        email: 'estudiante5@ziryab.es',
        name: 'Miguel',
        surname: 'Ramírez',
        ndSurname: 'Hernández',
        birthDate: new Date('2005-02-28'),
        dni: '12345682E',
        firebaseUID: 'qudgYcZ4yffQKgwBH2fqMi7s2UW2'

      },
      {
        email: 'estudiante6@ziryab.es',
        name: 'Sara',
        surname: 'Díaz',
        ndSurname: 'Torres',
        birthDate: new Date('2005-07-05'),
        dni: '12345683F',
        firebaseUID: 'rLJ2pTFTqmUPMR4Ecm1EZLtei6k1'

      },
      {
        email: 'estudiante7@ziryab.es',
        name: 'Javier',
        surname: 'Morales',
        ndSurname: 'García',
        birthDate: new Date('2005-04-18'),
        dni: '12345684G',
        firebaseUID: 'qsDSFbH23fdeWEOLyaTjEE7Ns7q2'

      },
      {
        email: 'estudiante8@ziryab.es',
        name: 'Elena',
        surname: 'Vega',
        ndSurname: 'López',
        birthDate: new Date('2005-12-02'),
        dni: '12345685H',
        firebaseUID: 'Nx39bBPiNVeoHqiD02F1KgEraju2'

      },
      {
        email: 'estudiante9@ziryab.es',
        name: 'Raúl',
        surname: 'Soto',
        ndSurname: 'Pérez',
        birthDate: new Date('2005-05-30'),
        dni: '12345686I',
        firebaseUID: 'ushZC3Rz5XgkKDCWzHzWR4GVBlq2'

      },
      {
        email: 'estudiante10@ziryab.es',
        name: 'Ana',
        surname: 'Cabrera',
        ndSurname: 'Martín',
        birthDate: new Date('2005-08-19'),
        dni: '12345687J',
        firebaseUID: '43V128mDK5Ygg8zEKX09wTxNYxC2'

      },
      {
        email: 'estudiante11@ziryab.es',
        name: 'Diego',
        surname: 'Herrera',
        ndSurname: 'Castro',
        birthDate: new Date('2005-03-08'),
        dni: '12345688K',
        firebaseUID: 'AIaNJM2RS1RlE1gS1m5nhKRBmdh1'

      },
      {
        email: 'estudiante12@ziryab.es',
        name: 'Clara',
        surname: 'Ortiz',
        ndSurname: 'Ruiz',
        birthDate: new Date('2005-11-11'),
        dni: '12345689L',
        firebaseUID: 'iPlyPfaRPfOKTECfzwGRBm6Ljbe2'

      },
      {
        email: 'estudiante13@ziryab.es',
        name: 'Pablo',
        surname: 'Navarro',
        ndSurname: 'Santos',
        birthDate: new Date('2005-06-06'),
        dni: '12345690M',
        firebaseUID: 'YO4es7xeMTYHpHNLMl13O0KpXDx2'

      },
      {
        email: 'estudiante14@ziryab.es',
        name: 'Isabel',
        surname: 'Domínguez',
        ndSurname: 'Vargas',
        birthDate: new Date('2005-09-25'),
        dni: '12345691N',
        firebaseUID: 'exVQzZaGhDXJGBSXNHDNYAq1bhK2'

      },
      {
        email: 'estudiante15@ziryab.es',
        name: 'Sergio',
        surname: 'Gil',
        ndSurname: 'Rojas',
        birthDate: new Date('2005-01-20'),
        dni: '12345692O',
        firebaseUID: 'cG5pfVnsnLMRrqf6oZdOqtMq8K22'

      },
      {
        email: 'estudiante16@ziryab.es',
        name: 'Natalia',
        surname: 'Molina',
        ndSurname: 'Fernández',
        birthDate: new Date('2005-10-14'),
        dni: '12345693P',
        firebaseUID: 'iPHNwCEdq9V48B0wVR3eIhEmmPu1'

      },
      // 17–36: 7 clases nuevas × 3 alumnos (ASIR tarde, SMR/IT/ME mañana y tarde). Sustituir firebaseUID en Firebase.
      {
        email: 'estudiante17@ziryab.es',
        name: 'Andrés',
        surname: 'Jiménez',
        ndSurname: 'Castro',
        birthDate: new Date('2005-02-12'),
        dni: '12345694Q',
        firebaseUID: 'TgwGg8y2xsZgmQtgJQyZMVHDLW93'
      },
      {
        email: 'estudiante18@ziryab.es',
        name: 'Laura',
        surname: 'Iglesias',
        ndSurname: 'Rubio',
        birthDate: new Date('2005-06-21'),
        dni: '12345695R',
        firebaseUID: 'dKxGy8QhS5MCX4J7tMNWHVtvcTP2'
      },
      {
        email: 'estudiante19@ziryab.es',
        name: 'Marcos',
        surname: 'Moya',
        ndSurname: 'Delgado',
        birthDate: new Date('2005-09-03'),
        dni: '12345696S',
        firebaseUID: 'kKuIFUJQDZRn0MhsKnkXKRlXLQJ2'
      },
      {
        email: 'estudiante20@ziryab.es',
        name: 'Paula',
        surname: 'Peña',
        ndSurname: 'Ramos',
        birthDate: new Date('2005-04-07'),
        dni: '12345697T',
        firebaseUID: 'lybcLodHB5hsR1UtogLm0o6ty0e2'
      },
      {
        email: 'estudiante21@ziryab.es',
        name: 'Hugo',
        surname: 'Blanco',
        ndSurname: 'Suárez',
        birthDate: new Date('2005-11-28'),
        dni: '12345698U',
        firebaseUID: '8YvPa1EtCyPSL7SL67dOoVSTOD13'
      },
      {
        email: 'estudiante22@ziryab.es',
        name: 'Cristina',
        surname: 'Martín',
        ndSurname: 'Núñez',
        birthDate: new Date('2005-01-16'),
        dni: '12345699V',
        firebaseUID: 'Tzdp4oNnkvf1u4XCmQGWgsM3gHK2'
      },
      {
        email: 'estudiante23@ziryab.es',
        name: 'Iván',
        surname: 'Vázquez',
        ndSurname: 'Serrano',
        birthDate: new Date('2005-08-08'),
        dni: '12345700W',
        firebaseUID: 'Eh330fXGEiWaROCQgd0XRGPH3hk2'
      },
      {
        email: 'estudiante24@ziryab.es',
        name: 'Marta',
        surname: 'Romero',
        ndSurname: 'Pastor',
        birthDate: new Date('2005-03-25'),
        dni: '12345701X',
        firebaseUID: 'b36CGlQ0UsYkOq6ec9Uo1znoEff1'
      },
      {
        email: 'estudiante25@ziryab.es',
        name: 'Óscar',
        surname: 'Aguirre',
        ndSurname: 'Gutiérrez',
        birthDate: new Date('2005-07-14'),
        dni: '12345702Y',
        firebaseUID: 'K5RzIeZH8TawgqhB1gpWcLWnfpk1'
      },
      {
        email: 'estudiante26@ziryab.es',
        name: 'Alba',
        surname: 'Ortega',
        ndSurname: 'Campos',
        birthDate: new Date('2005-12-19'),
        dni: '12345703Z',
        firebaseUID: 'Xhh9wVex6phRbHLeLY06fjKOvBy1'
      },
      {
        email: 'estudiante27@ziryab.es',
        name: 'Daniel',
        surname: 'Reyes',
        ndSurname: 'Flores',
        birthDate: new Date('2005-05-02'),
        dni: '12345704A',
        firebaseUID: 'FN4W1CjSu8YN1jeVpyTjkWgxYmm1'
      },
      {
        email: 'estudiante28@ziryab.es',
        name: 'Irene',
        surname: 'Medina',
        ndSurname: 'Cortés',
        birthDate: new Date('2005-10-30'),
        dni: '12345705B',
        firebaseUID: 'uwqc6nm3RCOCygJzVpWBtbZGYDU2'
      },
      {
        email: 'estudiante29@ziryab.es',
        name: 'Adrián',
        surname: 'León',
        ndSurname: 'Herrero',
        birthDate: new Date('2005-02-22'),
        dni: '12345706C',
        firebaseUID: 'kXfMPYB6CYPsDW12xgi91oAvndp2'
      },
      {
        email: 'estudiante30@ziryab.es',
        name: 'Beatriz',
        surname: 'Méndez',
        ndSurname: 'Guerrero',
        birthDate: new Date('2005-06-11'),
        dni: '12345707D',
        firebaseUID: 'f20crWZj3JTqhW0GqV5DJK7hNe43'
      },
      {
        email: 'estudiante31@ziryab.es',
        name: 'Rubén',
        surname: 'Sanz',
        ndSurname: 'Prieto',
        birthDate: new Date('2005-09-17'),
        dni: '12345708E',
        firebaseUID: 's0QSxbLGQzRw4GZvBhyVXaI9a4l2'
      },
      {
        email: 'estudiante32@ziryab.es',
        name: 'Noelia',
        surname: 'Calvo',
        ndSurname: 'Márquez',
        birthDate: new Date('2005-04-29'),
        dni: '12345709F',
        firebaseUID: 'uHWrJyCTswMsDskfwaqLCpxupmE2'
      },
      {
        email: 'estudiante33@ziryab.es',
        name: 'Víctor',
        surname: 'Gallego',
        ndSurname: 'Ibáñez',
        birthDate: new Date('2005-11-05'),
        dni: '12345710G',
        firebaseUID: 'nTcUPMcqgJWNEJZcEbJ5LObOszq1'
      },
      {
        email: 'estudiante34@ziryab.es',
        name: 'Silvia',
        surname: 'Pascual',
        ndSurname: 'Santana',
        birthDate: new Date('2005-01-08'),
        dni: '12345711H',
        firebaseUID: 'NozdILkX6JXyWQhBs7siCBdEq8p1'
      },
      {
        email: 'estudiante35@ziryab.es',
        name: 'Álvaro',
        surname: 'Benítez',
        ndSurname: 'Rivas',
        birthDate: new Date('2005-08-26'),
        dni: '12345712I',
        firebaseUID: 'anW191avEvUPh8LPJeNYkxcaRgk2'
      },
      {
        email: 'estudiante36@ziryab.es',
        name: 'Carmen',
        surname: 'Carrasco',
        ndSurname: 'Lozano',
        birthDate: new Date('2005-03-19'),
        dni: '12345713J',
        firebaseUID: 'TyUR5o8pYIMFcwm4y0Z319MTib92'
      },
      // 37–48: 2º curso (8 clases × 3 alumnos). Sustituir firebaseUID en Firebase.
      {
        email: 'estudiante37@ziryab.es',
        name: 'Raúl',
        surname: 'Herrera',
        ndSurname: 'Vega',
        birthDate: new Date('2004-05-10'),
        dni: '12345714K',
        firebaseUID: 'SEEDSTUDENT37PENDINGFIREBASE00'
      },
      {
        email: 'estudiante38@ziryab.es',
        name: 'Elena',
        surname: 'Navarro',
        ndSurname: 'Paredes',
        birthDate: new Date('2004-08-22'),
        dni: '12345715L',
        firebaseUID: 'SEEDSTUDENT38PENDINGFIREBASE00'
      },
      {
        email: 'estudiante39@ziryab.es',
        name: 'Jorge',
        surname: 'Muñoz',
        ndSurname: 'Cabrera',
        birthDate: new Date('2004-12-03'),
        dni: '12345716M',
        firebaseUID: 'SEEDSTUDENT39PENDINGFIREBASE00'
      },
      {
        email: 'estudiante40@ziryab.es',
        name: 'Claudia',
        surname: 'Soto',
        ndSurname: 'Miranda',
        birthDate: new Date('2004-02-17'),
        dni: '12345717N',
        firebaseUID: 'SEEDSTUDENT40PENDINGFIREBASE00'
      },
      {
        email: 'estudiante41@ziryab.es',
        name: 'Pablo',
        surname: 'Castillo',
        ndSurname: 'Ríos',
        birthDate: new Date('2004-09-28'),
        dni: '12345718O',
        firebaseUID: 'SEEDSTUDENT41PENDINGFIREBASE00'
      },
      {
        email: 'estudiante42@ziryab.es',
        name: 'Lucía',
        surname: 'Garrido',
        ndSurname: 'Soler',
        birthDate: new Date('2004-11-14'),
        dni: '12345719P',
        firebaseUID: 'SEEDSTUDENT42PENDINGFIREBASE00'
      },
      {
        email: 'estudiante43@ziryab.es',
        name: 'Diego',
        surname: 'Lorenzo',
        ndSurname: 'Méndez',
        birthDate: new Date('2004-06-06'),
        dni: '12345720Q',
        firebaseUID: 'SEEDSTUDENT43PENDINGFIREBASE00'
      },
      {
        email: 'estudiante44@ziryab.es',
        name: 'Andrea',
        surname: 'Pozo',
        ndSurname: 'Salazar',
        birthDate: new Date('2004-01-25'),
        dni: '12345721R',
        firebaseUID: 'SEEDSTUDENT44PENDINGFIREBASE00'
      },
      {
        email: 'estudiante45@ziryab.es',
        name: 'Roberto',
        surname: 'Cruz',
        ndSurname: 'Parra',
        birthDate: new Date('2004-10-09'),
        dni: '12345722S',
        firebaseUID: 'SEEDSTUDENT45PENDINGFIREBASE00'
      },
      {
        email: 'estudiante46@ziryab.es',
        name: 'Nerea',
        surname: 'Velasco',
        ndSurname: 'Aguilar',
        birthDate: new Date('2004-04-13'),
        dni: '12345723T',
        firebaseUID: 'SEEDSTUDENT46PENDINGFIREBASE00'
      },
      {
        email: 'estudiante47@ziryab.es',
        name: 'Sergio',
        surname: 'Bravo',
        ndSurname: 'Fuentes',
        birthDate: new Date('2004-07-31'),
        dni: '12345724U',
        firebaseUID: 'SEEDSTUDENT47PENDINGFIREBASE00'
      },
      {
        email: 'estudiante48@ziryab.es',
        name: 'Patricia',
        surname: 'Montes',
        ndSurname: 'Crespo',
        birthDate: new Date('2004-03-07'),
        dni: '12345725V',
        firebaseUID: 'SEEDSTUDENT48PENDINGFIREBASE00'
      }
      ]
    });


  // Crear Profesores

  console.log('Creando Profesores...');
  const teachers = await
    prisma.teacher.createMany({
      data: [
        {
          email: 'profesor1@ziryab.es',
          name: 'David',
          surname: 'Moreno',
          ndSurname: 'García',
          birthDate: new Date('1982-01-20'),
          dni: '56789012E',
          firebaseUID: 'MKbPoFL95xejnjFmyYlImQE7tOk2',

        },
        {
          email: 'profesor2@ziryab.es',
          name: 'Ana',
          surname: 'Torres',
          ndSurname: 'Pérez',
          birthDate: new Date('1985-06-14'),
          dni: '67890123F',
          firebaseUID: 'JWmpSblNodcB9MwsFM2JNth2ZTY2',

        },
        {
          email: 'profesor3@ziryab.es',
          name: 'Pedro',
          surname: 'Jiménez',
          ndSurname: 'Ruiz',
          birthDate: new Date('1979-09-25'),
          dni: '78901234G',
          firebaseUID: 'hpkhF6ieCQOxNVsioPViTHZojCB3'
        },
        {
          email: 'profesor4@ziryab.es',
          name: 'Elena',
          surname: 'Castillo',
          ndSurname: 'Vega',
          birthDate: new Date('1987-12-03'),
          dni: '89012345H',
          firebaseUID: 'RlgqXD2vhBbHx1daDqAO3QtcApM2'
        },
        {
          email: 'profesor5@ziryab.es',
          name: 'Javier',
          surname: 'Moreno',
          ndSurname: 'Santos',
          birthDate: new Date('1982-07-14'),
          dni: '89012346I',
          firebaseUID: 'Y6QpMjvXmShHu8IZQrp4wHWqRer1',
        },
        {
          email: 'profesor6@ziryab.es',
          name: 'Marta',
          surname: 'González',
          ndSurname: 'López',
          birthDate: new Date('1990-03-22'),
          dni: '89012347J',
          firebaseUID: 'WLSA60eLGGgTSTR9fbYNeG20Cb23',
        },
        {
          email: 'profesor7@ziryab.es',
          name: 'Luis',
          surname: 'Ramírez',
          ndSurname: 'Martínez',
          birthDate: new Date('1985-09-11'),
          dni: '89012348K',
          firebaseUID: 'ClmRPX2Hk5gf0rLXSm2JSIzEU8X2',
        },
        {
          email: 'profesor8@ziryab.es',
          name: 'Ana',
          surname: 'Díaz',
          ndSurname: 'Ruiz',
          birthDate: new Date('1988-06-05'),
          dni: '89012349L',
          firebaseUID: 'UIDPROF8ABCDEFG1234567890',
        },
        {
          email: 'profesor9@ziryab.es',
          name: 'Pablo',
          surname: 'Torres',
          ndSurname: 'Castro',
          birthDate: new Date('1983-11-20'),
          dni: '89012350M',
          firebaseUID: 'Yu2CYwwrWzW4afuLBzqp48R8ZMZ2',
        },
        {
          email: 'profesor10@ziryab.es',
          name: 'Sofía',
          surname: 'Vega',
          ndSurname: 'Cabrera',
          birthDate: new Date('1989-02-18'),
          dni: '89012351N',
          firebaseUID: 'd0TNYj0kzBRi89YPltCZQqhlCE62',
        },
        {
          email: 'profesor11@ziryab.es',
          name: 'Diego',
          surname: 'Ortiz',
          ndSurname: 'Santos',
          birthDate: new Date('1986-08-25'),
          dni: '89012352O',
          firebaseUID: 'JxOBWml4w9fhtL5aHBgeEonL4kU2',
        },
        {
          email: 'profesor12@ziryab.es',
          name: 'Clara',
          surname: 'Molina',
          ndSurname: 'Fernández',
          birthDate: new Date('1991-01-14'),
          dni: '89012353P',
          firebaseUID: '4VLJu3tt0UPJOdcTRmw1n6UuKR02',
        },
        {
          email: 'profesor13@ziryab.es',
          name: 'Raúl',
          surname: 'Rojas',
          ndSurname: 'Domínguez',
          birthDate: new Date('1984-05-30'),
          dni: '89012354Q',
          firebaseUID: 'sLfuOnAaUEaGlTRZZRkx7VP1xlu2',
        },
        {
          email: 'profesor14@ziryab.es',
          name: 'Isabel',
          surname: 'Gil',
          ndSurname: 'Vargas',
          birthDate: new Date('1987-03-09'),
          dni: '89012355R',
          firebaseUID: 'g1Z5UbKbhDXcoTZKWDR4nKDOwB43',
        },
        {
          email: 'profesor15@ziryab.es',
          name: 'Andrés',
          surname: 'Soto',
          ndSurname: 'Herrera',
          birthDate: new Date('1985-12-17'),
          dni: '89012356S',
          firebaseUID: 'XoEQ8VjTY6TgEizcQdbLEZw6vC22',
        },
        {
          email: 'profesor16@ziryab.es',
          name: 'Natalia',
          surname: 'Romero',
          ndSurname: 'Pérez',
          birthDate: new Date('1989-09-02'),
          dni: '89012357T',
          firebaseUID: 'Zb0kJebCfIQ2jJUQI2vnwWxzLcf1',
        },
        {
          email: 'profesor17@ziryab.es',
          name: 'Jorge',
          surname: 'Castro',
          ndSurname: 'Vega',
          birthDate: new Date('1986-07-19'),
          dni: '89012358U',
          firebaseUID: 'KZ3uGP130zavLdfQFuibLzQbqMf2',
        },
        {
          email: 'profesor18@ziryab.es',
          name: 'Elena',
          surname: 'Ramírez',
          ndSurname: 'Martínez',
          birthDate: new Date('1988-11-23'),
          dni: '89012359V',
          firebaseUID: 'H4NvRLX4HFd4Z7Ixs9ZI0R5ru4s1',
        },
        // 19–29: plantilla ampliada seed TFG. Sustituir firebaseUID en Firebase.
        {
          email: 'profesor19@ziryab.es',
          name: 'Alberto',
          surname: 'Méndez',
          ndSurname: 'Ortega',
          birthDate: new Date('1984-04-08'),
          dni: '89012360W',
          firebaseUID: 'SEEDTEACHER19PENDINGFIREBASE00',
        },
        {
          email: 'profesor20@ziryab.es',
          name: 'Cristina',
          surname: 'Delgado',
          ndSurname: 'Ramos',
          birthDate: new Date('1990-10-21'),
          dni: '89012361X',
          firebaseUID: 'SEEDTEACHER20PENDINGFIREBASE00',
        },
        {
          email: 'profesor21@ziryab.es',
          name: 'Fernando',
          surname: 'Iglesias',
          ndSurname: 'Campos',
          birthDate: new Date('1981-02-27'),
          dni: '89012362Y',
          firebaseUID: 'SEEDTEACHER21PENDINGFIREBASE00',
        },
        {
          email: 'profesor22@ziryab.es',
          name: 'Mónica',
          surname: 'Vargas',
          ndSurname: 'Peña',
          birthDate: new Date('1987-07-16'),
          dni: '89012363Z',
          firebaseUID: 'SEEDTEACHER22PENDINGFIREBASE00',
        },
        {
          email: 'profesor23@ziryab.es',
          name: 'Iván',
          surname: 'Herrero',
          ndSurname: 'León',
          birthDate: new Date('1983-12-01'),
          dni: '89012364A',
          firebaseUID: 'SEEDTEACHER23PENDINGFIREBASE00',
        },
        {
          email: 'profesor24@ziryab.es',
          name: 'Rosa',
          surname: 'Aguilar',
          ndSurname: 'Núñez',
          birthDate: new Date('1992-05-19'),
          dni: '89012365B',
          firebaseUID: 'SEEDTEACHER24PENDINGFIREBASE00',
        },
        {
          email: 'profesor25@ziryab.es',
          name: 'Óscar',
          surname: 'Prieto',
          ndSurname: 'Sanz',
          birthDate: new Date('1986-09-09'),
          dni: '89012366C',
          firebaseUID: 'SEEDTEACHER25PENDINGFIREBASE00',
        },
        {
          email: 'profesor26@ziryab.es',
          name: 'Teresa',
          surname: 'Blanco',
          ndSurname: 'Medina',
          birthDate: new Date('1980-11-30'),
          dni: '89012367D',
          firebaseUID: 'SEEDTEACHER26PENDINGFIREBASE00',
        },
        {
          email: 'profesor27@ziryab.es',
          name: 'Marc',
          surname: 'Fuentes',
          ndSurname: 'Cortés',
          birthDate: new Date('1988-03-12'),
          dni: '89012368E',
          firebaseUID: 'SEEDTEACHER27PENDINGFIREBASE00',
        },
        {
          email: 'profesor28@ziryab.es',
          name: 'Lucía',
          surname: 'Reyes',
          ndSurname: 'Gallego',
          birthDate: new Date('1991-08-24'),
          dni: '89012369F',
          firebaseUID: 'SEEDTEACHER28PENDINGFIREBASE00',
        },
        {
          email: 'profesor29@ziryab.es',
          name: 'Héctor',
          surname: 'Pascual',
          ndSurname: 'Benítez',
          birthDate: new Date('1985-01-07'),
          dni: '89012370G',
          firebaseUID: 'SEEDTEACHER29PENDINGFIREBASE00',
        },
        {
          email: 'profesor30@ziryab.es',
          name: 'Carlos',
          surname: 'Ibáñez',
          ndSurname: 'Muñoz',
          birthDate: new Date('1984-04-16'),
          dni: '89012371H',
          firebaseUID: 'SEEDTEACHER30PENDINGFIREBASE00',
        },
        {
          email: 'profesor31@ziryab.es',
          name: 'Isabel',
          surname: 'Navarro',
          ndSurname: 'Romero',
          birthDate: new Date('1989-10-28'),
          dni: '89012372I',
          firebaseUID: 'SEEDTEACHER31PENDINGFIREBASE00',
        },
        {
          email: 'profesor32@ziryab.es',
          name: 'Elena',
          surname: 'Nito',
          ndSurname: 'Delbosque',
          birthDate: new Date('1989-10-28'),
          dni: '89012355M',
          firebaseUID: '09FFJw8SWqQVmIJxU3xV0yuel303',
        }
      ]
    });

  console.log('Creando contrasenas de alumnos (tutor id 1)...');
  const demoStudentPassword = encryptCredential('Estudiante123456');
  const studentPasswords = await prisma.studentPassword.createMany({
    data: [
      { idStudent: 1, password: demoStudentPassword, idTutor: 1 },
      { idStudent: 2, password: demoStudentPassword, idTutor: 1 },
      { idStudent: 3, password: demoStudentPassword, idTutor: 1 },
    ],
  });

  // Crear Administradores

  console.log('Creando administradores...');
  await prisma.admin.createMany({
    data: [
      {
        email: 'admin1@ziryab.com',
        name: 'Roberto',
        surname: 'Sánchez',
        ndSurname: 'González',
        birthDate: new Date('1975-04-10'),
        dni: '90123456I',
        firebaseUID: 'YIayPOGzYRhl6Z0qlgfRsNZ4Gli1'
      },
      {
        email: 'admin2@ziryab.com',
        name: 'Mercedes',
        surname: 'Martín',
        ndSurname: 'Díaz',
        birthDate: new Date('1980-08-18'),
        dni: '01234567J',
        firebaseUID: 'UKay0FiHWiaY880sGoqYEavKANB3'
      }
    ]
  });


  // Crear Ciclos pero ciclos de verdad no cursos tanto ingles tanta poya luego mira que pasa
  // Crear Ciclos no cursos tanto ingles tanta poya luego mira que pasa

  console.log('Creando Ciclos...');
  const courses = await
    prisma.course.createMany({
      data: [
        {
          name: 'DAM',
          description: 'Desarrollo de aplicaciones Multiplataforma',
          duration: 2
        },
        {
          name: 'DAW',
          description: 'Desarollo de aplicaciones Web',
          duration: 2
        },
        {
          name: 'ASIR',
          description: 'Administración de sistemas informáticos en red',
          duration: 2
        },
        {
          name: 'SMR',
          description: 'Sistemas microinformáticos y redes',
          duration: 2
        },
        {
          name: 'IT',
          description: 'Instalaciones de telecomunicaciones',
          duration: 2
        },
        {
          name: 'ME',
          description: 'Mantenimiento electrónico',
          duration: 2
        }
      ]
    });

  // Crear Asignaturas

  console.log('Creando Asignaturas...');
  const subjects = await
    prisma.subject.createMany({
      data: [
        {
          name: 'Programación',
          grade: '1',
          hours: 8,
          description: 'Asignatura de Programación',
          idCourse: 1
        },
        {
          name: 'Base de datos',
          grade: '1',
          hours: 6,
          description: 'Asignatura de Base de Datos',
          idCourse: 1
        },
        {
          name: 'Sistemas Informáticos',
          grade: '1',
          hours: 5,
          description: 'Asignatura de Sistemas Informáticos',
          idCourse: 1
        },
        {
          name: 'Lenguaje de Marcas y Sistemas de Gestión de Información',
          grade: '1',
          hours: 3,
          description: 'Asignatura de ',
          idCourse: 1
        },
        {
          name: 'Entornos de Desarrollo',
          grade: '1',
          hours: 3,
          description: 'Asignatura de EDES',
          idCourse: 1
        },
        {
          name: 'IPE',
          grade: '1',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad',
          idCourse: 1
        },
        {
          name: 'Sostenibilidad Aplicada al Sistema Productivo',
          grade: '1',
          hours: 1,
          description: 'Asignatura de Sostenibilidad',
          idCourse: 1
        },
        {
          name: 'Digitalización',
          grade: '1',
          hours: 1,
          description: 'Asignatura de Digitalización',
          idCourse: 1
        },
        {
          name: 'Programación',
          grade: '1',
          hours: 8,
          description: 'Asignatura de ',
          idCourse: 2
        },
        {
          name: 'Base de datos',
          grade: '1',
          hours: 6,
          description: 'Asignatura de ',
          idCourse: 2
        },
        {
          name: 'Sistemas Informáticos',
          grade: '1',
          hours: 5,
          description: 'Asignatura de ',
          idCourse: 2
        },
        {
          name: 'Lenguaje de Marcas y Sistemas de Gestión de Información',
          grade: '1',
          hours: 3,
          description: 'Asignatura de ',
          idCourse: 2
        },
        {
          name: 'Entornos de Desarrollo',
          grade: '1',
          hours: 3,
          description: 'Asignatura de ',
          idCourse: 2
        },
        {
          name: 'IPE',
          grade: '1',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad',
          idCourse: 2
        },
        {
          name: 'Sostenibilidad Aplicada al Sistema Productivo',
          grade: '1',
          hours: 1,
          description: 'Asignatura de ',
          idCourse: 2
        },
        {
          name: 'Digitalización',
          grade: '1',
          hours: 1,
          description: 'Asignatura de ',
          idCourse: 2
        },
        {
          name: 'Implantación de sistemas operativos',
          grade: '1',
          hours: 7,
          description: 'Asignatura de ',
          idCourse: 3
        },
        {
          name: 'Planificación y administración de redes',
          grade: '1',
          hours: 6,
          description: 'Asignatura de ',
          idCourse: 3
        },
        {
          name: 'Fundamentos de hardware',
          grade: '1',
          hours: 3,
          description: 'Asignatura de ',
          idCourse: 3
        },
        {
          name: 'Lenguaje de Marcas y Sistemas de Gestión de Información',
          grade: '1',
          hours: 3,
          description: 'Asignatura de ',
          idCourse: 3
        },
        {
          name: 'Gestión de bases de datos',
          grade: '1',
          hours: 6,
          description: 'Asignatura de ',
          idCourse: 3
        },
        {
          name: 'IPE',
          grade: '1',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad',
          idCourse: 3
        },
        {
          name: 'Sostenibilidad Aplicada al Sistema Productivo',
          grade: '1',
          hours: 1,
          description: 'Asignatura de ',
          idCourse: 3
        },
        {
          name: 'Digitalización',
          grade: '1',
          hours: 1,
          description: 'Asignatura de ',
          idCourse: 3
        },
        {
          name: 'Aplicaciones ofimáticas',
          grade: '1',
          hours: 7,
          description: 'Asignatura de ',
          idCourse: 4
        },
        {
          name: 'Montaje y mantenimiento de equipos',
          grade: '1',
          hours: 6,
          description: 'Asignatura de ',
          idCourse: 4
        },
        {
          name: 'Redes locales',
          grade: '1',
          hours: 7,
          description: 'Asignatura de ',
          idCourse: 4
        },
        {
          name: 'Sistemas operativos monopuesto',
          grade: '1',
          hours: 5,
          description: 'Asignatura de ',
          idCourse: 4
        },
        {
          name: 'IPE',
          grade: '1',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad',
          idCourse: 4
        },
        {
          name: 'Sostenibilidad Aplicada al Sistema Productivo',
          grade: '1',
          hours: 1,
          description: 'Asignatura de ',
          idCourse: 4
        },
        {
          name: 'Digitalización',
          grade: '1',
          hours: 1,
          description: 'Asignatura de ',
          idCourse: 4
        },
        // IT — 1º curso (idCourse 5)
        {
          name: 'Infraestructuras comunes de telecomunicación en viviendas y edificios',
          grade: '1',
          hours: 4,
          description: 'Asignatura de Infraestructuras comunes de telecomunicación en viviendas y edificios',
          idCourse: 5
        },
        {
          name: 'Electrónica aplicada',
          grade: '1',
          hours: 6,
          description: 'Asignatura de Electrónica aplicada',
          idCourse: 5
        },
        {
          name: 'Equipos microinformáticos',
          grade: '1',
          hours: 4,
          description: 'Asignatura de Equipos microinformáticos',
          idCourse: 5
        },
        {
          name: 'Infraestructuras de redes de datos y sistemas de telefonía',
          grade: '1',
          hours: 6,
          description: 'Asignatura de Infraestructuras de redes de datos y sistemas de telefonía',
          idCourse: 5
        },
        {
          name: 'Instalaciones eléctricas básicas',
          grade: '1',
          hours: 5,
          description: 'Asignatura de Instalaciones eléctricas básicas',
          idCourse: 5
        },
        {
          name: 'IPE',
          grade: '1',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad',
          idCourse: 5
        },
        {
          name: 'Sostenibilidad aplicada al sistema productivo',
          grade: '1',
          hours: 1,
          description: 'Asignatura de Sostenibilidad aplicada al sistema productivo',
          idCourse: 5
        },
        {
          name: 'Digitalización aplicada al sistema productivo',
          grade: '1',
          hours: 1,
          description: 'Asignatura de Digitalización aplicada al sistema productivo',
          idCourse: 5
        },
        // ME — 1º curso (idCourse 6)
        {
          name: 'Circuitos electrónicos analógicos',
          grade: '1',
          hours: 7,
          description: 'Asignatura de Circuitos electrónicos analógicos',
          idCourse: 6
        },
        {
          name: 'Equipos programables',
          grade: '1',
          hours: 6,
          description: 'Asignatura de Equipos programables',
          idCourse: 6
        },
        {
          name: 'Mantenimiento de equipos de voz y datos',
          grade: '1',
          hours: 5,
          description: 'Asignatura de Mantenimiento de equipos de voz y datos',
          idCourse: 6
        },
        {
          name: 'Técnicas y proceso de montaje y mantenimiento de equipos electrónicos',
          grade: '1',
          hours: 5,
          description: 'Asignatura de Técnicas y proceso de montaje y mantenimiento de equipos electrónicos',
          idCourse: 6
        },
        {
          name: 'Infraestructuras y desarrollo del mantenimiento electrónico',
          grade: '1',
          hours: 2,
          description: 'Asignatura de Infraestructuras y desarrollo del mantenimiento electrónico',
          idCourse: 6
        },
        {
          name: 'IPE',
          grade: '1',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad',
          idCourse: 6
        },
        {
          name: 'Sostenibilidad aplicada al sistema productivo',
          grade: '1',
          hours: 1,
          description: 'Asignatura de Sostenibilidad aplicada al sistema productivo',
          idCourse: 6
        },
        {
          name: 'Digitalización aplicada al sistema productivo',
          grade: '1',
          hours: 1,
          description: 'Asignatura de Digitalización aplicada al sistema productivo',
          idCourse: 6
        },
        // DAM — 2º curso (idCourse 1)
        {
          name: 'Acceso a datos',
          grade: '2',
          hours: 4,
          description: 'Asignatura de Acceso a datos',
          idCourse: 1
        },
        {
          name: 'Desarrollo de interfaces',
          grade: '2',
          hours: 6,
          description: 'Asignatura de Desarrollo de interfaces',
          idCourse: 1
        },
        {
          name: 'Programación multimedia y dispositivos móviles',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Programación multimedia y dispositivos móviles',
          idCourse: 1
        },
        {
          name: 'Programación de servicios y procesos',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Programación de servicios y procesos',
          idCourse: 1
        },
        {
          name: 'Sistemas de gestión empresarial',
          grade: '2',
          hours: 4,
          description: 'Asignatura de Sistemas de gestión empresarial',
          idCourse: 1
        },
        {
          name: 'IPE II',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad II',
          idCourse: 1
        },
        {
          name: 'Optativa',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Optativa',
          idCourse: 1
        },
        {
          name: 'Proyecto Intermodular de Desarrollo de Aplicaciones Multiplataforma',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Proyecto Intermodular de Desarrollo de Aplicaciones Multiplataforma',
          idCourse: 1
        },
        {
          name: 'Inglés Profesional',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Inglés Profesional',
          idCourse: 1
        },
        // DAW — 2º curso (idCourse 2)
        {
          name: 'Desarrollo web en entorno cliente',
          grade: '2',
          hours: 6,
          description: 'Asignatura de Desarrollo web en entorno cliente',
          idCourse: 2
        },
        {
          name: 'Desarrollo web en entorno servidor',
          grade: '2',
          hours: 7,
          description: 'Asignatura de Desarrollo web en entorno servidor',
          idCourse: 2
        },
        {
          name: 'Despliegue de aplicaciones web',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Despliegue de aplicaciones web',
          idCourse: 2
        },
        {
          name: 'Diseño de interfaces web',
          grade: '2',
          hours: 5,
          description: 'Asignatura de Diseño de interfaces web',
          idCourse: 2
        },
        {
          name: 'IPE II',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad II',
          idCourse: 2
        },
        {
          name: 'Optativa',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Optativa',
          idCourse: 2
        },
        {
          name: 'Proyecto intermodular de desarrollo de aplicaciones web',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Proyecto intermodular de desarrollo de aplicaciones web',
          idCourse: 2
        },
        {
          name: 'Inglés Profesional',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Inglés Profesional',
          idCourse: 2
        },
        // ASIR — 2º curso (idCourse 3)
        {
          name: 'Administración de sistemas operativos',
          grade: '2',
          hours: 5,
          description: 'Asignatura de Administración de sistemas operativos',
          idCourse: 3
        },
        {
          name: 'Servicios de red e internet',
          grade: '2',
          hours: 5,
          description: 'Asignatura de Servicios de red e internet',
          idCourse: 3
        },
        {
          name: 'Implantación de aplicaciones web',
          grade: '2',
          hours: 4,
          description: 'Asignatura de Implantación de aplicaciones web',
          idCourse: 3
        },
        {
          name: 'Administración de sistemas gestores de bases de datos',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Administración de sistemas gestores de bases de datos',
          idCourse: 3
        },
        {
          name: 'Seguridad y alta disponibilidad',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Seguridad y alta disponibilidad',
          idCourse: 3
        },
        {
          name: 'IPE II',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad II',
          idCourse: 3
        },
        {
          name: 'Optativa',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Optativa',
          idCourse: 3
        },
        {
          name: 'Proyecto Intermodular de Administración de Sistemas Informáticos en Red',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Proyecto Intermodular de Administración de Sistemas Informáticos en Red',
          idCourse: 3
        },
        {
          name: 'Inglés Profesional',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Inglés Profesional',
          idCourse: 3
        },
        // SMR — 2º curso (idCourse 4)
        {
          name: 'Aplicaciones web',
          grade: '2',
          hours: 4,
          description: 'Asignatura de Aplicaciones web',
          idCourse: 4
        },
        {
          name: 'Seguridad informática',
          grade: '2',
          hours: 4,
          description: 'Asignatura de Seguridad informática',
          idCourse: 4
        },
        {
          name: 'Servicios en red',
          grade: '2',
          hours: 6,
          description: 'Asignatura de Servicios en red',
          idCourse: 4
        },
        {
          name: 'Sistemas operativos en red',
          grade: '2',
          hours: 6,
          description: 'Asignatura de Sistemas operativos en red',
          idCourse: 4
        },
        {
          name: 'IPE II',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad II',
          idCourse: 4
        },
        {
          name: 'Optativa',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Optativa',
          idCourse: 4
        },
        {
          name: 'Proyecto Intermodular de Sistemas Microinformáticos y Redes',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Proyecto Intermodular de Sistemas Microinformáticos y Redes',
          idCourse: 4
        },
        {
          name: 'Inglés Profesional',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Inglés Profesional',
          idCourse: 4
        },
        // IT — 2º curso (idCourse 5)
        {
          name: 'Instalaciones domóticas',
          grade: '2',
          hours: 5,
          description: 'Asignatura de Instalaciones domóticas',
          idCourse: 5
        },
        {
          name: 'Instalaciones de megafonía y sonorización',
          grade: '2',
          hours: 5,
          description: 'Asignatura de Instalaciones de megafonía y sonorización',
          idCourse: 5
        },
        {
          name: 'Circuito cerrado de televisión y seguridad electrónica',
          grade: '2',
          hours: 5,
          description: 'Asignatura de Circuito cerrado de televisión y seguridad electrónica',
          idCourse: 5
        },
        {
          name: 'Instalaciones de radiocomunicaciones',
          grade: '2',
          hours: 5,
          description: 'Asignatura de Instalaciones de radiocomunicaciones',
          idCourse: 5
        },
        {
          name: 'IPE II',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad II',
          idCourse: 5
        },
        {
          name: 'Optativa',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Optativa',
          idCourse: 5
        },
        {
          name: 'Proyecto Intermodular de Instalaciones de Telecomunicaciones',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Proyecto Intermodular de Instalaciones de Telecomunicaciones',
          idCourse: 5
        },
        {
          name: 'Inglés Profesional GM',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Inglés Profesional GM',
          idCourse: 5
        },
        // ME — 2º curso (idCourse 6)
        {
          name: 'Mantenimiento de equipos y radiocomunicaciones',
          grade: '2',
          hours: 5,
          description: 'Asignatura de Mantenimiento de equipos y radiocomunicaciones',
          idCourse: 6
        },
        {
          name: 'Mantenimiento de equipos de electrónica industrial',
          grade: '2',
          hours: 7,
          description: 'Asignatura de Mantenimiento de equipos de electrónica industrial',
          idCourse: 6
        },
        {
          name: 'Mantenimiento de equipos de audio',
          grade: '2',
          hours: 4,
          description: 'Asignatura de Mantenimiento de equipos de audio',
          idCourse: 6
        },
        {
          name: 'Mantenimiento de equipos de vídeo',
          grade: '2',
          hours: 4,
          description: 'Asignatura de Mantenimiento de equipos de vídeo',
          idCourse: 6
        },
        {
          name: 'IPE II',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Itinerario personal para la empleabilidad II',
          idCourse: 6
        },
        {
          name: 'Optativa',
          grade: '2',
          hours: 3,
          description: 'Asignatura de Optativa',
          idCourse: 6
        },
        {
          name: 'Proyecto Intermodular de Mantenimiento Electrónico',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Proyecto Intermodular de Mantenimiento Electrónico',
          idCourse: 6
        },
        {
          name: 'Inglés Profesional',
          grade: '2',
          hours: 2,
          description: 'Asignatura de Inglés Profesional',
          idCourse: 6
        },
      ]
    });

  // Crear Grupos

  console.log('Creando grupos...');
  const groups = await
    prisma.group.createMany({
      data: [
        {
          name: 'Mañana',
          capacity: 20
        },
        {
          name: 'Tarde',
          capacity: 20
        },
        {
          name: 'A',
          capacity: 20
        },
        {
          name: 'B',
          capacity: 20
        }
      ]
    });

  // Crear relaciones Profesor-Asignatura-Grupo

  /*
    for (let i = 0; i < students.length; i++) {
      for (let j = 0; j < subjects.length; j++) {
        if ((i < 3) && (j < 9)) {
          const asignar = await Promise.all([
            prisma.studentOnSubjectOnGroup.createMany({
              data: [
                {
                  idStudent: i
                  idGroup: 1
                  idSubject: j
                }
              ]
            })
          ])
        } else if(i < 6 && j < 17){
          const asignar = await Promise.all([
            prisma.studentOnSubjectOnGroup.createMany({
              data: [
                {
                  idStudent: i
                  idGroup: 1
                  idSubject: j
                }
              ]
            })
          ])
        } else if(i < 9 && j < 25){
          const asignar = await Promise.all([
            prisma.studentOnSubjectOnGroup.createMany({
              data: [
                {
                  idStudent: i
                  idGroup: 1
                  idSubject: j
                }
              ]
            })
          ])
        }else if(i < 6 && j < 17){
          const asignar = await Promise.all([
            prisma.studentOnSubjectOnGroup.createMany({
              data: [
                {
                  idStudent: i
                  idGroup: 1
                  idSubject: j
                }
              ]
            })
          ])
        } else if(i < 6 && j < 17){
          const asignar = await Promise.all([
            prisma.studentOnSubjectOnGroup.createMany({
              data: [
                {
                  idStudent: i
                  idGroup: 1
                  idSubject: j
                }
              ]
            })
          ])
        }
        
  
      }
  
    }
    */

    console.log('Creando Enrollments(Student-Subject-Group)...');
  const enrollments = await


    prisma.studentOnSubjectOnGroup.createMany({


      data: [
        //Estudiante 1 en DAM grupo mañana
        {
          idStudent: 1,
          idGroup: 1,
          idSubject: 1,
          schoolYear: acaYear
        },
        {
          idStudent: 1,
          idGroup: 1,
          idSubject: 2,
          schoolYear: acaYear
        },
        {
          idStudent: 1,
          idGroup: 1,
          idSubject: 3,
          schoolYear: acaYear
        },
        {
          idStudent: 1,
          idGroup: 1,
          idSubject: 4,
          schoolYear: acaYear
        },
        {
          idStudent: 1,
          idGroup: 1,
          idSubject: 5,
          schoolYear: acaYear
        },
        {
          idStudent: 1,
          idGroup: 1,
          idSubject: 6,
          schoolYear: acaYear
        },
        {
          idStudent: 1,
          idGroup: 1,
          idSubject: 7,
          schoolYear: acaYear
        },
        {
          idStudent: 1,
          idGroup: 1,
          idSubject: 8,
          schoolYear: acaYear
        },
        //Estudiante 2 en DAM grupo mañana
        {
          idStudent: 2,
          idGroup: 1,
          idSubject: 1,
          schoolYear: acaYear
        },
        {
          idStudent: 2,
          idGroup: 1,
          idSubject: 2,
          schoolYear: acaYear
        },
        {
          idStudent: 2,
          idGroup: 1,
          idSubject: 3,
          schoolYear: acaYear
        },
        {
          idStudent: 2,
          idGroup: 1,
          idSubject: 4,
          schoolYear: acaYear
        },
        {
          idStudent: 2,
          idGroup: 1,
          idSubject: 5,
          schoolYear: acaYear
        },
        {
          idStudent: 2,
          idGroup: 1,
          idSubject: 6,
          schoolYear: acaYear
        },
        {
          idStudent: 2,
          idGroup: 1,
          idSubject: 7,
          schoolYear: acaYear
        },
        {
          idStudent: 2,
          idGroup: 1,
          idSubject: 8,
          schoolYear: acaYear
        },
        //Estudiante 3 en DAM grupo mañana
        {
          idStudent: 3,
          idGroup: 1,
          idSubject: 1,
          schoolYear: acaYear
        },
        {
          idStudent: 3,
          idGroup: 1,
          idSubject: 2,
          schoolYear: acaYear
        },
        {
          idStudent: 3,
          idGroup: 1,
          idSubject: 3,
          schoolYear: acaYear
        },
        {
          idStudent: 3,
          idGroup: 1,
          idSubject: 4,
          schoolYear: acaYear
        },
        {
          idStudent: 3,
          idGroup: 1,
          idSubject: 5,
          schoolYear: acaYear
        },
        {
          idStudent: 3,
          idGroup: 1,
          idSubject: 6,
          schoolYear: acaYear
        },
        {
          idStudent: 3,
          idGroup: 1,
          idSubject: 7,
          schoolYear: acaYear
        },
        {
          idStudent: 3,
          idGroup: 1,
          idSubject: 8,
          schoolYear: acaYear
        },
        //Estudiante 4 en DAM grupo tarde
        {
          idStudent: 4,
          idGroup: 2,
          idSubject: 1,
          schoolYear: acaYear
        },
        {
          idStudent: 4,
          idGroup: 2,
          idSubject: 2,
          schoolYear: acaYear
        },
        {
          idStudent: 4,
          idGroup: 2,
          idSubject: 3,
          schoolYear: acaYear
        },
        {
          idStudent: 4,
          idGroup: 2,
          idSubject: 4,
          schoolYear: acaYear
        },
        {
          idStudent: 4,
          idGroup: 2,
          idSubject: 5,
          schoolYear: acaYear
        },
        {
          idStudent: 4,
          idGroup: 2,
          idSubject: 6,
          schoolYear: acaYear
        },
        {
          idStudent: 4,
          idGroup: 2,
          idSubject: 7,
          schoolYear: acaYear
        },
        {
          idStudent: 4,
          idGroup: 2,
          idSubject: 8,
          schoolYear: acaYear
        },
        //Estudiante 5 en DAM grupo Tarde
        {
          idStudent: 5,
          idGroup: 2,
          idSubject: 1,
          schoolYear: acaYear
        },
        {
          idStudent: 5,
          idGroup: 2,
          idSubject: 2,
          schoolYear: acaYear
        },
        {
          idStudent: 5,
          idGroup: 2,
          idSubject: 3,
          schoolYear: acaYear
        },
        {
          idStudent: 5,
          idGroup: 2,
          idSubject: 4,
          schoolYear: acaYear
        },
        {
          idStudent: 5,
          idGroup: 2,
          idSubject: 5,
          schoolYear: acaYear
        },
        {
          idStudent: 5,
          idGroup: 2,
          idSubject: 6,
          schoolYear: acaYear
        },
        {
          idStudent: 5,
          idGroup: 2,
          idSubject: 7,
          schoolYear: acaYear
        },
        {
          idStudent: 5,
          idGroup: 2,
          idSubject: 8,
          schoolYear: acaYear
        },
        //Estudiante 6 en DAM grupo Tarde
        {
          idStudent: 6,
          idGroup: 2,
          idSubject: 1,
          schoolYear: acaYear
        },
        {
          idStudent: 6,
          idGroup: 2,
          idSubject: 2,
          schoolYear: acaYear
        },
        {
          idStudent: 6,
          idGroup: 2,
          idSubject: 3,
          schoolYear: acaYear
        },
        {
          idStudent: 6,
          idGroup: 2,
          idSubject: 4,
          schoolYear: acaYear
        },
        {
          idStudent: 6,
          idGroup: 2,
          idSubject: 5,
          schoolYear: acaYear
        },
        {
          idStudent: 6,
          idGroup: 2,
          idSubject: 6,
          schoolYear: acaYear
        },
        {
          idStudent: 6,
          idGroup: 2,
          idSubject: 7,
          schoolYear: acaYear
        },
        {
          idStudent: 6,
          idGroup: 2,
          idSubject: 8,
          schoolYear: acaYear
        },
        //Estudiante 7 en DAW grupo mañana
        
        {
          idStudent: 7,
          idGroup: 1,
          idSubject: 9,
          schoolYear: acaYear
        },
        {
          idStudent: 7,
          idGroup: 1,
          idSubject: 10,
          schoolYear: acaYear
        },
        {
          idStudent: 7,
          idGroup: 1,
          idSubject: 11,
          schoolYear: acaYear
        },
        {
          idStudent: 7,
          idGroup: 1,
          idSubject: 12,
          schoolYear: acaYear
        },
        {
          idStudent: 7,
          idGroup: 1,
          idSubject: 13,
          schoolYear: acaYear
        },
        {
          idStudent: 7,
          idGroup: 1,
          idSubject: 14,
          schoolYear: acaYear
        },
        {
          idStudent: 7,
          idGroup: 1,
          idSubject: 15,
          schoolYear: acaYear
        },
        {
          idStudent: 7,
          idGroup: 1,
          idSubject: 16,
          schoolYear: acaYear
        },
        //Estudiante 8 en DAW grupo mañana
        {
          idStudent: 8,
          idGroup: 1,
          idSubject: 9,
          schoolYear: acaYear
        },
        {
          idStudent: 8,
          idGroup: 1,
          idSubject: 10,
          schoolYear: acaYear
        },
        {
          idStudent: 8,
          idGroup: 1,
          idSubject: 11,
          schoolYear: acaYear
        },
        {
          idStudent: 8,
          idGroup: 1,
          idSubject: 12,
          schoolYear: acaYear
        },
        {
          idStudent: 8,
          idGroup: 1,
          idSubject: 13,
          schoolYear: acaYear
        },
        {
          idStudent: 8,
          idGroup: 1,
          idSubject: 14,
          schoolYear: acaYear
        },
        {
          idStudent: 8,
          idGroup: 1,
          idSubject: 15,
          schoolYear: acaYear
        },
        {
          idStudent: 8,
          idGroup: 1,
          idSubject: 16,
          schoolYear: acaYear
        },
        // Estudiante 9 en DAW grupo mañana
        {
          idStudent: 9,
          idGroup: 1,
          idSubject: 9,
          schoolYear: acaYear
        },
        {
          idStudent: 9,
          idGroup: 1,
          idSubject: 10,
          schoolYear: acaYear
        },
        {
          idStudent: 9,
          idGroup: 1,
          idSubject: 11,
          schoolYear: acaYear
        },
        {
          idStudent: 9,
          idGroup: 1,
          idSubject: 12,
          schoolYear: acaYear
        },
        {
          idStudent: 9,
          idGroup: 1,
          idSubject: 13,
          schoolYear: acaYear
        },
        {
          idStudent: 9,
          idGroup: 1,
          idSubject: 14,
          schoolYear: acaYear
        },
        {
          idStudent: 9,
          idGroup: 1,
          idSubject: 15,
          schoolYear: acaYear
        },
        {
          idStudent: 9,
          idGroup: 1,
          idSubject: 16,
          schoolYear: acaYear
        },
        //Estudiante 10 en DAW grupo tarde
        {
          idStudent: 10,
          idGroup: 2,
          idSubject: 9,
          schoolYear: acaYear
        },
        {
          idStudent: 10,
          idGroup: 2,
          idSubject: 10,
          schoolYear: acaYear
        },
        {
          idStudent: 10,
          idGroup: 2,
          idSubject: 11,
          schoolYear: acaYear
        },
        {
          idStudent: 10,
          idGroup: 2,
          idSubject: 12,
          schoolYear: acaYear
        },
        {
          idStudent: 10,
          idGroup: 2,
          idSubject: 13,
          schoolYear: acaYear
        },
        {
          idStudent: 10,
          idGroup: 2,
          idSubject: 14,
          schoolYear: acaYear
        },
        {
          idStudent: 10,
          idGroup: 2,
          idSubject: 15,
          schoolYear: acaYear
        },
        {
          idStudent: 10,
          idGroup: 2,
          idSubject: 16,
          schoolYear: acaYear
        },
        //Estudiante 11 en DAW grupo tarde
        {
          idStudent: 11,
          idGroup: 2,
          idSubject: 9,
          schoolYear: acaYear
        },
        {
          idStudent: 11,
          idGroup: 2,
          idSubject: 10,
          schoolYear: acaYear
        },
        {
          idStudent: 11,
          idGroup: 2,
          idSubject: 11,
          schoolYear: acaYear
        },
        {
          idStudent: 11,
          idGroup: 2,
          idSubject: 12,
          schoolYear: acaYear
        },
        {
          idStudent: 11,
          idGroup: 2,
          idSubject: 13,
          schoolYear: acaYear
        },
        {
          idStudent: 11,
          idGroup: 2,
          idSubject: 14,
          schoolYear: acaYear
        },
        {
          idStudent: 11,
          idGroup: 2,
          idSubject: 15,
          schoolYear: acaYear
        },
        {
          idStudent: 11,
          idGroup: 2,
          idSubject: 16,
          schoolYear: acaYear
        },
        //Estudiante 12 en DAW grupo tarde
        {
          idStudent: 12,
          idGroup: 2,
          idSubject: 9,
          schoolYear: acaYear
        },
        {
          idStudent: 12,
          idGroup: 2,
          idSubject: 10,
          schoolYear: acaYear
        },
        {
          idStudent: 12,
          idGroup: 2,
          idSubject: 11,
          schoolYear: acaYear
        },
        {
          idStudent: 12,
          idGroup: 2,
          idSubject: 12,
          schoolYear: acaYear
        },
        {
          idStudent: 12,
          idGroup: 2,
          idSubject: 13,
          schoolYear: acaYear
        },
        {
          idStudent: 12,
          idGroup: 2,
          idSubject: 14,
          schoolYear: acaYear
        },
        {
          idStudent: 12,
          idGroup: 2,
          idSubject: 15,
          schoolYear: acaYear
        },
        {
          idStudent: 12,
          idGroup: 2,
          idSubject: 16,
          schoolYear: acaYear
        },
        //Estudiante 13 en ASIR grupo mañana
        {
          idStudent: 13,
          idGroup: 1,
          idSubject: 17,
          schoolYear: acaYear
        },
        {
          idStudent: 13,
          idGroup: 1,
          idSubject: 18,
          schoolYear: acaYear
        },
        {
          idStudent: 13,
          idGroup: 1,
          idSubject: 19,
          schoolYear: acaYear
        },
        {
          idStudent: 13,
          idGroup: 1,
          idSubject: 20,
          schoolYear: acaYear
        },
        {
          idStudent: 13,
          idGroup: 1,
          idSubject: 21,
          schoolYear: acaYear
        },
        {
          idStudent: 13,
          idGroup: 1,
          idSubject: 22,
          schoolYear: acaYear
        },
        {
          idStudent: 13,
          idGroup: 1,
          idSubject: 23,
          schoolYear: acaYear
        },
        {
          idStudent: 13,
          idGroup: 1,
          idSubject: 24,
          schoolYear: acaYear
        },
        //Estudiante 14 en ASIR grupo mañana
        {
          idStudent: 14,
          idGroup: 1,
          idSubject: 17,
          schoolYear: acaYear
        },
        {
          idStudent: 14,
          idGroup: 1,
          idSubject: 18,
          schoolYear: acaYear
        },
        {
          idStudent: 14,
          idGroup: 1,
          idSubject: 19,
          schoolYear: acaYear
        },
        {
          idStudent: 14,
          idGroup: 1,
          idSubject: 20,
          schoolYear: acaYear
        },
        {
          idStudent: 14,
          idGroup: 1,
          idSubject: 21,
          schoolYear: acaYear
        },
        {
          idStudent: 14,
          idGroup: 1,
          idSubject: 22,
          schoolYear: acaYear
        },
        {
          idStudent: 14,
          idGroup: 1,
          idSubject: 23,
          schoolYear: acaYear
        },
        {
          idStudent: 14,
          idGroup: 1,
          idSubject: 24,
          schoolYear: acaYear
        },
        //Estudiante 15 en ASIR grupo mañana
        {
          idStudent: 15,
          idGroup: 1,
          idSubject: 17,
          schoolYear: acaYear
        },
        {
          idStudent: 15,
          idGroup: 1,
          idSubject: 18,
          schoolYear: acaYear
        },
        {
          idStudent: 15,
          idGroup: 1,
          idSubject: 19,
          schoolYear: acaYear
        },
        {
          idStudent: 15,
          idGroup: 1,
          idSubject: 20,
          schoolYear: acaYear
        },
        {
          idStudent: 15,
          idGroup: 1,
          idSubject: 21,
          schoolYear: acaYear
        },
        {
          idStudent: 15,
          idGroup: 1,
          idSubject: 22,
          schoolYear: acaYear
        },
        {
          idStudent: 15,
          idGroup: 1,
          idSubject: 23,
          schoolYear: acaYear
        },
        {
          idStudent: 15,
          idGroup: 1,
          idSubject: 24,
          schoolYear: acaYear
        },
        // Estudiante 16 en SMR grupo mañana
        {
          idStudent: 16,
          idGroup: 1,
          idSubject: 25,
          schoolYear: acaYear
        },
        {
          idStudent: 16,
          idGroup: 1,
          idSubject: 26,
          schoolYear: acaYear
        },
        {
          idStudent: 16,
          idGroup: 1,
          idSubject: 27,
          schoolYear: acaYear
        },
        {
          idStudent: 16,
          idGroup: 1,
          idSubject: 28,
          schoolYear: acaYear
        },
        {
          idStudent: 16,
          idGroup: 1,
          idSubject: 29,
          schoolYear: acaYear
        },
        {
          idStudent: 16,
          idGroup: 1,
          idSubject: 30,
          schoolYear: acaYear
        },
        {
          idStudent: 16,
          idGroup: 1,
          idSubject: 31,
          schoolYear: acaYear
        },
        // Estudiante 17 en SMR grupo mañana
        {
          idStudent: 17,
          idGroup: 1,
          idSubject: 25,
          schoolYear: acaYear
        },
        {
          idStudent: 17,
          idGroup: 1,
          idSubject: 26,
          schoolYear: acaYear
        },
        {
          idStudent: 17,
          idGroup: 1,
          idSubject: 27,
          schoolYear: acaYear
        },
        {
          idStudent: 17,
          idGroup: 1,
          idSubject: 28,
          schoolYear: acaYear
        },
        {
          idStudent: 17,
          idGroup: 1,
          idSubject: 29,
          schoolYear: acaYear
        },
        {
          idStudent: 17,
          idGroup: 1,
          idSubject: 30,
          schoolYear: acaYear
        },
        {
          idStudent: 17,
          idGroup: 1,
          idSubject: 31,
          schoolYear: acaYear
        },
        // Estudiante 18 en SMR grupo mañana
        {
          idStudent: 18,
          idGroup: 1,
          idSubject: 25,
          schoolYear: acaYear
        },
        {
          idStudent: 18,
          idGroup: 1,
          idSubject: 26,
          schoolYear: acaYear
        },
        {
          idStudent: 18,
          idGroup: 1,
          idSubject: 27,
          schoolYear: acaYear
        },
        {
          idStudent: 18,
          idGroup: 1,
          idSubject: 28,
          schoolYear: acaYear
        },
        {
          idStudent: 18,
          idGroup: 1,
          idSubject: 29,
          schoolYear: acaYear
        },
        {
          idStudent: 18,
          idGroup: 1,
          idSubject: 30,
          schoolYear: acaYear
        },
        {
          idStudent: 18,
          idGroup: 1,
          idSubject: 31,
          schoolYear: acaYear
        },
        // Estudiante 19 en IT grupo mañana
        {
          idStudent: 19,
          idGroup: 1,
          idSubject: 32,
          schoolYear: acaYear
        },
        {
          idStudent: 19,
          idGroup: 1,
          idSubject: 33,
          schoolYear: acaYear
        },
        {
          idStudent: 19,
          idGroup: 1,
          idSubject: 34,
          schoolYear: acaYear
        },
        {
          idStudent: 19,
          idGroup: 1,
          idSubject: 35,
          schoolYear: acaYear
        },
        {
          idStudent: 19,
          idGroup: 1,
          idSubject: 36,
          schoolYear: acaYear
        },
        {
          idStudent: 19,
          idGroup: 1,
          idSubject: 37,
          schoolYear: acaYear
        },
        {
          idStudent: 19,
          idGroup: 1,
          idSubject: 38,
          schoolYear: acaYear
        },
        {
          idStudent: 19,
          idGroup: 1,
          idSubject: 39,
          schoolYear: acaYear
        },
        // Estudiante 20 en IT grupo mañana
        {
          idStudent: 20,
          idGroup: 1,
          idSubject: 32,
          schoolYear: acaYear
        },
        {
          idStudent: 20,
          idGroup: 1,
          idSubject: 33,
          schoolYear: acaYear
        },
        {
          idStudent: 20,
          idGroup: 1,
          idSubject: 34,
          schoolYear: acaYear
        },
        {
          idStudent: 20,
          idGroup: 1,
          idSubject: 35,
          schoolYear: acaYear
        },
        {
          idStudent: 20,
          idGroup: 1,
          idSubject: 36,
          schoolYear: acaYear
        },
        {
          idStudent: 20,
          idGroup: 1,
          idSubject: 37,
          schoolYear: acaYear
        },
        {
          idStudent: 20,
          idGroup: 1,
          idSubject: 38,
          schoolYear: acaYear
        },
        {
          idStudent: 20,
          idGroup: 1,
          idSubject: 39,
          schoolYear: acaYear
        },
        // Estudiante 21 en IT grupo mañana
        {
          idStudent: 21,
          idGroup: 1,
          idSubject: 32,
          schoolYear: acaYear
        },
        {
          idStudent: 21,
          idGroup: 1,
          idSubject: 33,
          schoolYear: acaYear
        },
        {
          idStudent: 21,
          idGroup: 1,
          idSubject: 34,
          schoolYear: acaYear
        },
        {
          idStudent: 21,
          idGroup: 1,
          idSubject: 35,
          schoolYear: acaYear
        },
        {
          idStudent: 21,
          idGroup: 1,
          idSubject: 36,
          schoolYear: acaYear
        },
        {
          idStudent: 21,
          idGroup: 1,
          idSubject: 37,
          schoolYear: acaYear
        },
        {
          idStudent: 21,
          idGroup: 1,
          idSubject: 38,
          schoolYear: acaYear
        },
        {
          idStudent: 21,
          idGroup: 1,
          idSubject: 39,
          schoolYear: acaYear
        },
        // Estudiante 22 en ME grupo mañana
        {
          idStudent: 22,
          idGroup: 1,
          idSubject: 40,
          schoolYear: acaYear
        },
        {
          idStudent: 22,
          idGroup: 1,
          idSubject: 41,
          schoolYear: acaYear
        },
        {
          idStudent: 22,
          idGroup: 1,
          idSubject: 42,
          schoolYear: acaYear
        },
        {
          idStudent: 22,
          idGroup: 1,
          idSubject: 43,
          schoolYear: acaYear
        },
        {
          idStudent: 22,
          idGroup: 1,
          idSubject: 44,
          schoolYear: acaYear
        },
        {
          idStudent: 22,
          idGroup: 1,
          idSubject: 45,
          schoolYear: acaYear
        },
        {
          idStudent: 22,
          idGroup: 1,
          idSubject: 46,
          schoolYear: acaYear
        },
        {
          idStudent: 22,
          idGroup: 1,
          idSubject: 47,
          schoolYear: acaYear
        },
        // Estudiante 23 en ME grupo mañana
        {
          idStudent: 23,
          idGroup: 1,
          idSubject: 40,
          schoolYear: acaYear
        },
        {
          idStudent: 23,
          idGroup: 1,
          idSubject: 41,
          schoolYear: acaYear
        },
        {
          idStudent: 23,
          idGroup: 1,
          idSubject: 42,
          schoolYear: acaYear
        },
        {
          idStudent: 23,
          idGroup: 1,
          idSubject: 43,
          schoolYear: acaYear
        },
        {
          idStudent: 23,
          idGroup: 1,
          idSubject: 44,
          schoolYear: acaYear
        },
        {
          idStudent: 23,
          idGroup: 1,
          idSubject: 45,
          schoolYear: acaYear
        },
        {
          idStudent: 23,
          idGroup: 1,
          idSubject: 46,
          schoolYear: acaYear
        },
        {
          idStudent: 23,
          idGroup: 1,
          idSubject: 47,
          schoolYear: acaYear
        },
        // Estudiante 24 en ME grupo mañana
        {
          idStudent: 24,
          idGroup: 1,
          idSubject: 40,
          schoolYear: acaYear
        },
        {
          idStudent: 24,
          idGroup: 1,
          idSubject: 41,
          schoolYear: acaYear
        },
        {
          idStudent: 24,
          idGroup: 1,
          idSubject: 42,
          schoolYear: acaYear
        },
        {
          idStudent: 24,
          idGroup: 1,
          idSubject: 43,
          schoolYear: acaYear
        },
        {
          idStudent: 24,
          idGroup: 1,
          idSubject: 44,
          schoolYear: acaYear
        },
        {
          idStudent: 24,
          idGroup: 1,
          idSubject: 45,
          schoolYear: acaYear
        },
        {
          idStudent: 24,
          idGroup: 1,
          idSubject: 46,
          schoolYear: acaYear
        },
        {
          idStudent: 24,
          idGroup: 1,
          idSubject: 47,
          schoolYear: acaYear
        },
        // Estudiante 25 en DAM 2º grupo mañana
        {
          idStudent: 25,
          idGroup: 1,
          idSubject: 48,
          schoolYear: acaYear
        },
        {
          idStudent: 25,
          idGroup: 1,
          idSubject: 49,
          schoolYear: acaYear
        },
        {
          idStudent: 25,
          idGroup: 1,
          idSubject: 50,
          schoolYear: acaYear
        },
        {
          idStudent: 25,
          idGroup: 1,
          idSubject: 51,
          schoolYear: acaYear
        },
        {
          idStudent: 25,
          idGroup: 1,
          idSubject: 52,
          schoolYear: acaYear
        },
        {
          idStudent: 25,
          idGroup: 1,
          idSubject: 53,
          schoolYear: acaYear
        },
        {
          idStudent: 25,
          idGroup: 1,
          idSubject: 54,
          schoolYear: acaYear
        },
        {
          idStudent: 25,
          idGroup: 1,
          idSubject: 55,
          schoolYear: acaYear
        },
        {
          idStudent: 25,
          idGroup: 1,
          idSubject: 56,
          schoolYear: acaYear
        },
        // Estudiante 26 en DAM 2º grupo mañana
        {
          idStudent: 26,
          idGroup: 1,
          idSubject: 48,
          schoolYear: acaYear
        },
        {
          idStudent: 26,
          idGroup: 1,
          idSubject: 49,
          schoolYear: acaYear
        },
        {
          idStudent: 26,
          idGroup: 1,
          idSubject: 50,
          schoolYear: acaYear
        },
        {
          idStudent: 26,
          idGroup: 1,
          idSubject: 51,
          schoolYear: acaYear
        },
        {
          idStudent: 26,
          idGroup: 1,
          idSubject: 52,
          schoolYear: acaYear
        },
        {
          idStudent: 26,
          idGroup: 1,
          idSubject: 53,
          schoolYear: acaYear
        },
        {
          idStudent: 26,
          idGroup: 1,
          idSubject: 54,
          schoolYear: acaYear
        },
        {
          idStudent: 26,
          idGroup: 1,
          idSubject: 55,
          schoolYear: acaYear
        },
        {
          idStudent: 26,
          idGroup: 1,
          idSubject: 56,
          schoolYear: acaYear
        },
        // Estudiante 27 en DAM 2º grupo mañana
        {
          idStudent: 27,
          idGroup: 1,
          idSubject: 48,
          schoolYear: acaYear
        },
        {
          idStudent: 27,
          idGroup: 1,
          idSubject: 49,
          schoolYear: acaYear
        },
        {
          idStudent: 27,
          idGroup: 1,
          idSubject: 50,
          schoolYear: acaYear
        },
        {
          idStudent: 27,
          idGroup: 1,
          idSubject: 51,
          schoolYear: acaYear
        },
        {
          idStudent: 27,
          idGroup: 1,
          idSubject: 52,
          schoolYear: acaYear
        },
        {
          idStudent: 27,
          idGroup: 1,
          idSubject: 53,
          schoolYear: acaYear
        },
        {
          idStudent: 27,
          idGroup: 1,
          idSubject: 54,
          schoolYear: acaYear
        },
        {
          idStudent: 27,
          idGroup: 1,
          idSubject: 55,
          schoolYear: acaYear
        },
        {
          idStudent: 27,
          idGroup: 1,
          idSubject: 56,
          schoolYear: acaYear
        },
        // Estudiante 28 en DAM 2º grupo tarde
        {
          idStudent: 28,
          idGroup: 2,
          idSubject: 48,
          schoolYear: acaYear
        },
        {
          idStudent: 28,
          idGroup: 2,
          idSubject: 49,
          schoolYear: acaYear
        },
        {
          idStudent: 28,
          idGroup: 2,
          idSubject: 50,
          schoolYear: acaYear
        },
        {
          idStudent: 28,
          idGroup: 2,
          idSubject: 51,
          schoolYear: acaYear
        },
        {
          idStudent: 28,
          idGroup: 2,
          idSubject: 52,
          schoolYear: acaYear
        },
        {
          idStudent: 28,
          idGroup: 2,
          idSubject: 53,
          schoolYear: acaYear
        },
        {
          idStudent: 28,
          idGroup: 2,
          idSubject: 54,
          schoolYear: acaYear
        },
        {
          idStudent: 28,
          idGroup: 2,
          idSubject: 55,
          schoolYear: acaYear
        },
        {
          idStudent: 28,
          idGroup: 2,
          idSubject: 56,
          schoolYear: acaYear
        },
        // Estudiante 29 en DAM 2º grupo tarde
        {
          idStudent: 29,
          idGroup: 2,
          idSubject: 48,
          schoolYear: acaYear
        },
        {
          idStudent: 29,
          idGroup: 2,
          idSubject: 49,
          schoolYear: acaYear
        },
        {
          idStudent: 29,
          idGroup: 2,
          idSubject: 50,
          schoolYear: acaYear
        },
        {
          idStudent: 29,
          idGroup: 2,
          idSubject: 51,
          schoolYear: acaYear
        },
        {
          idStudent: 29,
          idGroup: 2,
          idSubject: 52,
          schoolYear: acaYear
        },
        {
          idStudent: 29,
          idGroup: 2,
          idSubject: 53,
          schoolYear: acaYear
        },
        {
          idStudent: 29,
          idGroup: 2,
          idSubject: 54,
          schoolYear: acaYear
        },
        {
          idStudent: 29,
          idGroup: 2,
          idSubject: 55,
          schoolYear: acaYear
        },
        {
          idStudent: 29,
          idGroup: 2,
          idSubject: 56,
          schoolYear: acaYear
        },
        // Estudiante 30 en DAM 2º grupo tarde
        {
          idStudent: 30,
          idGroup: 2,
          idSubject: 48,
          schoolYear: acaYear
        },
        {
          idStudent: 30,
          idGroup: 2,
          idSubject: 49,
          schoolYear: acaYear
        },
        {
          idStudent: 30,
          idGroup: 2,
          idSubject: 50,
          schoolYear: acaYear
        },
        {
          idStudent: 30,
          idGroup: 2,
          idSubject: 51,
          schoolYear: acaYear
        },
        {
          idStudent: 30,
          idGroup: 2,
          idSubject: 52,
          schoolYear: acaYear
        },
        {
          idStudent: 30,
          idGroup: 2,
          idSubject: 53,
          schoolYear: acaYear
        },
        {
          idStudent: 30,
          idGroup: 2,
          idSubject: 54,
          schoolYear: acaYear
        },
        {
          idStudent: 30,
          idGroup: 2,
          idSubject: 55,
          schoolYear: acaYear
        },
        {
          idStudent: 30,
          idGroup: 2,
          idSubject: 56,
          schoolYear: acaYear
        },
        // Estudiante 31 en DAW 2º grupo mañana
        {
          idStudent: 31,
          idGroup: 1,
          idSubject: 57,
          schoolYear: acaYear
        },
        {
          idStudent: 31,
          idGroup: 1,
          idSubject: 58,
          schoolYear: acaYear
        },
        {
          idStudent: 31,
          idGroup: 1,
          idSubject: 59,
          schoolYear: acaYear
        },
        {
          idStudent: 31,
          idGroup: 1,
          idSubject: 60,
          schoolYear: acaYear
        },
        {
          idStudent: 31,
          idGroup: 1,
          idSubject: 61,
          schoolYear: acaYear
        },
        {
          idStudent: 31,
          idGroup: 1,
          idSubject: 62,
          schoolYear: acaYear
        },
        {
          idStudent: 31,
          idGroup: 1,
          idSubject: 63,
          schoolYear: acaYear
        },
        {
          idStudent: 31,
          idGroup: 1,
          idSubject: 64,
          schoolYear: acaYear
        },
        // Estudiante 32 en DAW 2º grupo mañana
        {
          idStudent: 32,
          idGroup: 1,
          idSubject: 57,
          schoolYear: acaYear
        },
        {
          idStudent: 32,
          idGroup: 1,
          idSubject: 58,
          schoolYear: acaYear
        },
        {
          idStudent: 32,
          idGroup: 1,
          idSubject: 59,
          schoolYear: acaYear
        },
        {
          idStudent: 32,
          idGroup: 1,
          idSubject: 60,
          schoolYear: acaYear
        },
        {
          idStudent: 32,
          idGroup: 1,
          idSubject: 61,
          schoolYear: acaYear
        },
        {
          idStudent: 32,
          idGroup: 1,
          idSubject: 62,
          schoolYear: acaYear
        },
        {
          idStudent: 32,
          idGroup: 1,
          idSubject: 63,
          schoolYear: acaYear
        },
        {
          idStudent: 32,
          idGroup: 1,
          idSubject: 64,
          schoolYear: acaYear
        },
        // Estudiante 33 en DAW 2º grupo mañana
        {
          idStudent: 33,
          idGroup: 1,
          idSubject: 57,
          schoolYear: acaYear
        },
        {
          idStudent: 33,
          idGroup: 1,
          idSubject: 58,
          schoolYear: acaYear
        },
        {
          idStudent: 33,
          idGroup: 1,
          idSubject: 59,
          schoolYear: acaYear
        },
        {
          idStudent: 33,
          idGroup: 1,
          idSubject: 60,
          schoolYear: acaYear
        },
        {
          idStudent: 33,
          idGroup: 1,
          idSubject: 61,
          schoolYear: acaYear
        },
        {
          idStudent: 33,
          idGroup: 1,
          idSubject: 62,
          schoolYear: acaYear
        },
        {
          idStudent: 33,
          idGroup: 1,
          idSubject: 63,
          schoolYear: acaYear
        },
        {
          idStudent: 33,
          idGroup: 1,
          idSubject: 64,
          schoolYear: acaYear
        },
        // Estudiante 34 en DAW 2º grupo tarde
        {
          idStudent: 34,
          idGroup: 2,
          idSubject: 57,
          schoolYear: acaYear
        },
        {
          idStudent: 34,
          idGroup: 2,
          idSubject: 58,
          schoolYear: acaYear
        },
        {
          idStudent: 34,
          idGroup: 2,
          idSubject: 59,
          schoolYear: acaYear
        },
        {
          idStudent: 34,
          idGroup: 2,
          idSubject: 60,
          schoolYear: acaYear
        },
        {
          idStudent: 34,
          idGroup: 2,
          idSubject: 61,
          schoolYear: acaYear
        },
        {
          idStudent: 34,
          idGroup: 2,
          idSubject: 62,
          schoolYear: acaYear
        },
        {
          idStudent: 34,
          idGroup: 2,
          idSubject: 63,
          schoolYear: acaYear
        },
        {
          idStudent: 34,
          idGroup: 2,
          idSubject: 64,
          schoolYear: acaYear
        },
        // Estudiante 35 en DAW 2º grupo tarde
        {
          idStudent: 35,
          idGroup: 2,
          idSubject: 57,
          schoolYear: acaYear
        },
        {
          idStudent: 35,
          idGroup: 2,
          idSubject: 58,
          schoolYear: acaYear
        },
        {
          idStudent: 35,
          idGroup: 2,
          idSubject: 59,
          schoolYear: acaYear
        },
        {
          idStudent: 35,
          idGroup: 2,
          idSubject: 60,
          schoolYear: acaYear
        },
        {
          idStudent: 35,
          idGroup: 2,
          idSubject: 61,
          schoolYear: acaYear
        },
        {
          idStudent: 35,
          idGroup: 2,
          idSubject: 62,
          schoolYear: acaYear
        },
        {
          idStudent: 35,
          idGroup: 2,
          idSubject: 63,
          schoolYear: acaYear
        },
        {
          idStudent: 35,
          idGroup: 2,
          idSubject: 64,
          schoolYear: acaYear
        },
        // Estudiante 36 en DAW 2º grupo tarde
        {
          idStudent: 36,
          idGroup: 2,
          idSubject: 57,
          schoolYear: acaYear
        },
        {
          idStudent: 36,
          idGroup: 2,
          idSubject: 58,
          schoolYear: acaYear
        },
        {
          idStudent: 36,
          idGroup: 2,
          idSubject: 59,
          schoolYear: acaYear
        },
        {
          idStudent: 36,
          idGroup: 2,
          idSubject: 60,
          schoolYear: acaYear
        },
        {
          idStudent: 36,
          idGroup: 2,
          idSubject: 61,
          schoolYear: acaYear
        },
        {
          idStudent: 36,
          idGroup: 2,
          idSubject: 62,
          schoolYear: acaYear
        },
        {
          idStudent: 36,
          idGroup: 2,
          idSubject: 63,
          schoolYear: acaYear
        },
        {
          idStudent: 36,
          idGroup: 2,
          idSubject: 64,
          schoolYear: acaYear
        },
        // Estudiante 37 en ASIR 2º grupo mañana
        {
          idStudent: 37,
          idGroup: 1,
          idSubject: 65,
          schoolYear: acaYear
        },
        {
          idStudent: 37,
          idGroup: 1,
          idSubject: 66,
          schoolYear: acaYear
        },
        {
          idStudent: 37,
          idGroup: 1,
          idSubject: 67,
          schoolYear: acaYear
        },
        {
          idStudent: 37,
          idGroup: 1,
          idSubject: 68,
          schoolYear: acaYear
        },
        {
          idStudent: 37,
          idGroup: 1,
          idSubject: 69,
          schoolYear: acaYear
        },
        {
          idStudent: 37,
          idGroup: 1,
          idSubject: 70,
          schoolYear: acaYear
        },
        {
          idStudent: 37,
          idGroup: 1,
          idSubject: 71,
          schoolYear: acaYear
        },
        {
          idStudent: 37,
          idGroup: 1,
          idSubject: 72,
          schoolYear: acaYear
        },
        {
          idStudent: 37,
          idGroup: 1,
          idSubject: 73,
          schoolYear: acaYear
        },
        // Estudiante 38 en ASIR 2º grupo mañana
        {
          idStudent: 38,
          idGroup: 1,
          idSubject: 65,
          schoolYear: acaYear
        },
        {
          idStudent: 38,
          idGroup: 1,
          idSubject: 66,
          schoolYear: acaYear
        },
        {
          idStudent: 38,
          idGroup: 1,
          idSubject: 67,
          schoolYear: acaYear
        },
        {
          idStudent: 38,
          idGroup: 1,
          idSubject: 68,
          schoolYear: acaYear
        },
        {
          idStudent: 38,
          idGroup: 1,
          idSubject: 69,
          schoolYear: acaYear
        },
        {
          idStudent: 38,
          idGroup: 1,
          idSubject: 70,
          schoolYear: acaYear
        },
        {
          idStudent: 38,
          idGroup: 1,
          idSubject: 71,
          schoolYear: acaYear
        },
        {
          idStudent: 38,
          idGroup: 1,
          idSubject: 72,
          schoolYear: acaYear
        },
        {
          idStudent: 38,
          idGroup: 1,
          idSubject: 73,
          schoolYear: acaYear
        },
        // Estudiante 39 en ASIR 2º grupo mañana
        {
          idStudent: 39,
          idGroup: 1,
          idSubject: 65,
          schoolYear: acaYear
        },
        {
          idStudent: 39,
          idGroup: 1,
          idSubject: 66,
          schoolYear: acaYear
        },
        {
          idStudent: 39,
          idGroup: 1,
          idSubject: 67,
          schoolYear: acaYear
        },
        {
          idStudent: 39,
          idGroup: 1,
          idSubject: 68,
          schoolYear: acaYear
        },
        {
          idStudent: 39,
          idGroup: 1,
          idSubject: 69,
          schoolYear: acaYear
        },
        {
          idStudent: 39,
          idGroup: 1,
          idSubject: 70,
          schoolYear: acaYear
        },
        {
          idStudent: 39,
          idGroup: 1,
          idSubject: 71,
          schoolYear: acaYear
        },
        {
          idStudent: 39,
          idGroup: 1,
          idSubject: 72,
          schoolYear: acaYear
        },
        {
          idStudent: 39,
          idGroup: 1,
          idSubject: 73,
          schoolYear: acaYear
        },
        // Estudiante 40 en SMR 2º grupo mañana
        {
          idStudent: 40,
          idGroup: 1,
          idSubject: 74,
          schoolYear: acaYear
        },
        {
          idStudent: 40,
          idGroup: 1,
          idSubject: 75,
          schoolYear: acaYear
        },
        {
          idStudent: 40,
          idGroup: 1,
          idSubject: 76,
          schoolYear: acaYear
        },
        {
          idStudent: 40,
          idGroup: 1,
          idSubject: 77,
          schoolYear: acaYear
        },
        {
          idStudent: 40,
          idGroup: 1,
          idSubject: 78,
          schoolYear: acaYear
        },
        {
          idStudent: 40,
          idGroup: 1,
          idSubject: 79,
          schoolYear: acaYear
        },
        {
          idStudent: 40,
          idGroup: 1,
          idSubject: 80,
          schoolYear: acaYear
        },
        {
          idStudent: 40,
          idGroup: 1,
          idSubject: 81,
          schoolYear: acaYear
        },
        // Estudiante 41 en SMR 2º grupo mañana
        {
          idStudent: 41,
          idGroup: 1,
          idSubject: 74,
          schoolYear: acaYear
        },
        {
          idStudent: 41,
          idGroup: 1,
          idSubject: 75,
          schoolYear: acaYear
        },
        {
          idStudent: 41,
          idGroup: 1,
          idSubject: 76,
          schoolYear: acaYear
        },
        {
          idStudent: 41,
          idGroup: 1,
          idSubject: 77,
          schoolYear: acaYear
        },
        {
          idStudent: 41,
          idGroup: 1,
          idSubject: 78,
          schoolYear: acaYear
        },
        {
          idStudent: 41,
          idGroup: 1,
          idSubject: 79,
          schoolYear: acaYear
        },
        {
          idStudent: 41,
          idGroup: 1,
          idSubject: 80,
          schoolYear: acaYear
        },
        {
          idStudent: 41,
          idGroup: 1,
          idSubject: 81,
          schoolYear: acaYear
        },
        // Estudiante 42 en SMR 2º grupo mañana
        {
          idStudent: 42,
          idGroup: 1,
          idSubject: 74,
          schoolYear: acaYear
        },
        {
          idStudent: 42,
          idGroup: 1,
          idSubject: 75,
          schoolYear: acaYear
        },
        {
          idStudent: 42,
          idGroup: 1,
          idSubject: 76,
          schoolYear: acaYear
        },
        {
          idStudent: 42,
          idGroup: 1,
          idSubject: 77,
          schoolYear: acaYear
        },
        {
          idStudent: 42,
          idGroup: 1,
          idSubject: 78,
          schoolYear: acaYear
        },
        {
          idStudent: 42,
          idGroup: 1,
          idSubject: 79,
          schoolYear: acaYear
        },
        {
          idStudent: 42,
          idGroup: 1,
          idSubject: 80,
          schoolYear: acaYear
        },
        {
          idStudent: 42,
          idGroup: 1,
          idSubject: 81,
          schoolYear: acaYear
        },
        // Estudiante 43 en IT 2º grupo mañana
        {
          idStudent: 43,
          idGroup: 1,
          idSubject: 82,
          schoolYear: acaYear
        },
        {
          idStudent: 43,
          idGroup: 1,
          idSubject: 83,
          schoolYear: acaYear
        },
        {
          idStudent: 43,
          idGroup: 1,
          idSubject: 84,
          schoolYear: acaYear
        },
        {
          idStudent: 43,
          idGroup: 1,
          idSubject: 85,
          schoolYear: acaYear
        },
        {
          idStudent: 43,
          idGroup: 1,
          idSubject: 86,
          schoolYear: acaYear
        },
        {
          idStudent: 43,
          idGroup: 1,
          idSubject: 87,
          schoolYear: acaYear
        },
        {
          idStudent: 43,
          idGroup: 1,
          idSubject: 88,
          schoolYear: acaYear
        },
        {
          idStudent: 43,
          idGroup: 1,
          idSubject: 89,
          schoolYear: acaYear
        },
        // Estudiante 44 en IT 2º grupo mañana
        {
          idStudent: 44,
          idGroup: 1,
          idSubject: 82,
          schoolYear: acaYear
        },
        {
          idStudent: 44,
          idGroup: 1,
          idSubject: 83,
          schoolYear: acaYear
        },
        {
          idStudent: 44,
          idGroup: 1,
          idSubject: 84,
          schoolYear: acaYear
        },
        {
          idStudent: 44,
          idGroup: 1,
          idSubject: 85,
          schoolYear: acaYear
        },
        {
          idStudent: 44,
          idGroup: 1,
          idSubject: 86,
          schoolYear: acaYear
        },
        {
          idStudent: 44,
          idGroup: 1,
          idSubject: 87,
          schoolYear: acaYear
        },
        {
          idStudent: 44,
          idGroup: 1,
          idSubject: 88,
          schoolYear: acaYear
        },
        {
          idStudent: 44,
          idGroup: 1,
          idSubject: 89,
          schoolYear: acaYear
        },
        // Estudiante 45 en IT 2º grupo mañana
        {
          idStudent: 45,
          idGroup: 1,
          idSubject: 82,
          schoolYear: acaYear
        },
        {
          idStudent: 45,
          idGroup: 1,
          idSubject: 83,
          schoolYear: acaYear
        },
        {
          idStudent: 45,
          idGroup: 1,
          idSubject: 84,
          schoolYear: acaYear
        },
        {
          idStudent: 45,
          idGroup: 1,
          idSubject: 85,
          schoolYear: acaYear
        },
        {
          idStudent: 45,
          idGroup: 1,
          idSubject: 86,
          schoolYear: acaYear
        },
        {
          idStudent: 45,
          idGroup: 1,
          idSubject: 87,
          schoolYear: acaYear
        },
        {
          idStudent: 45,
          idGroup: 1,
          idSubject: 88,
          schoolYear: acaYear
        },
        {
          idStudent: 45,
          idGroup: 1,
          idSubject: 89,
          schoolYear: acaYear
        },
        // Estudiante 46 en ME 2º grupo mañana
        {
          idStudent: 46,
          idGroup: 1,
          idSubject: 90,
          schoolYear: acaYear
        },
        {
          idStudent: 46,
          idGroup: 1,
          idSubject: 91,
          schoolYear: acaYear
        },
        {
          idStudent: 46,
          idGroup: 1,
          idSubject: 92,
          schoolYear: acaYear
        },
        {
          idStudent: 46,
          idGroup: 1,
          idSubject: 93,
          schoolYear: acaYear
        },
        {
          idStudent: 46,
          idGroup: 1,
          idSubject: 94,
          schoolYear: acaYear
        },
        {
          idStudent: 46,
          idGroup: 1,
          idSubject: 95,
          schoolYear: acaYear
        },
        {
          idStudent: 46,
          idGroup: 1,
          idSubject: 96,
          schoolYear: acaYear
        },
        {
          idStudent: 46,
          idGroup: 1,
          idSubject: 97,
          schoolYear: acaYear
        },
        // Estudiante 47 en ME 2º grupo mañana
        {
          idStudent: 47,
          idGroup: 1,
          idSubject: 90,
          schoolYear: acaYear
        },
        {
          idStudent: 47,
          idGroup: 1,
          idSubject: 91,
          schoolYear: acaYear
        },
        {
          idStudent: 47,
          idGroup: 1,
          idSubject: 92,
          schoolYear: acaYear
        },
        {
          idStudent: 47,
          idGroup: 1,
          idSubject: 93,
          schoolYear: acaYear
        },
        {
          idStudent: 47,
          idGroup: 1,
          idSubject: 94,
          schoolYear: acaYear
        },
        {
          idStudent: 47,
          idGroup: 1,
          idSubject: 95,
          schoolYear: acaYear
        },
        {
          idStudent: 47,
          idGroup: 1,
          idSubject: 96,
          schoolYear: acaYear
        },
        {
          idStudent: 47,
          idGroup: 1,
          idSubject: 97,
          schoolYear: acaYear
        },
        // Estudiante 48 en ME 2º grupo mañana
        {
          idStudent: 48,
          idGroup: 1,
          idSubject: 90,
          schoolYear: acaYear
        },
        {
          idStudent: 48,
          idGroup: 1,
          idSubject: 91,
          schoolYear: acaYear
        },
        {
          idStudent: 48,
          idGroup: 1,
          idSubject: 92,
          schoolYear: acaYear
        },
        {
          idStudent: 48,
          idGroup: 1,
          idSubject: 93,
          schoolYear: acaYear
        },
        {
          idStudent: 48,
          idGroup: 1,
          idSubject: 94,
          schoolYear: acaYear
        },
        {
          idStudent: 48,
          idGroup: 1,
          idSubject: 95,
          schoolYear: acaYear
        },
        {
          idStudent: 48,
          idGroup: 1,
          idSubject: 96,
          schoolYear: acaYear
        },
        {
          idStudent: 48,
          idGroup: 1,
          idSubject: 97,
          schoolYear: acaYear
        },
      ]
    });



  // Crear relaciones Profesor-Asignatura-Grupo

  console.log('Creando Assignments(Teacher-Subject-Group)...');
  const assignments = await
    prisma.teacherOnSubjectOnGroup.createMany({
      data: [
        //DAM MAÑANA
        //profesor 1 programación DAM mañana
        {
          idTeacher: 1,
          idSubject: 1,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 2 bbdd DAM mañana 
        {
          idTeacher: 2,
          idSubject: 2,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 3 sistemas DAM mañana 
        {
          idTeacher: 3,
          idSubject: 3,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 4 Lenguaje de marcas DAM mañana 
        {
          idTeacher: 4,
          idSubject: 4,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 5 Entornos de desarrollo DAM mañana 
        {
          idTeacher: 5,
          idSubject: 5,
          idGroup: 1,
          schoolYear: acaYear
        },
        // profesor 6 Ipe Dam mañana 
        {
          idTeacher: 6,
          idSubject: 6,
          idGroup: 1,
          schoolYear: acaYear
        },
        // profesor 7 sostenibilidad dam mañana 
        {
          idTeacher: 7,
          idSubject: 7,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 2 digitalización dam mañana 
        {
          idTeacher: 2,
          idSubject: 8,
          idGroup: 1,
          schoolYear: acaYear
        },

        //profesor8 da programacion en 1 daw de mañana
        {
          idTeacher: 8,
          idSubject: 9,
          idGroup: 1,
          schoolYear: acaYear
        },
//cambio para seguridad 
        //profesor 30 da base de datos en 1 daw de mañana
        {
          idTeacher: 30,
          idSubject: 10,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 9 da sistemas informaticos en 1 daw mañana
        {
          idTeacher: 9,
          idSubject: 11,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 10 da lenguaje de marcas en 1 daw mañana
        {
          idTeacher: 10,
          idSubject: 12,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 16 da edes en 1 daw mañana
        {
          idTeacher: 16,
          idSubject: 13,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 31 da ipe en 1 daw mañana
        {
          idTeacher: 31,
          idSubject: 14,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 20 da sostenibilidad en 1 daw mañana
        {
          idTeacher: 20,
          idSubject: 15,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 1 da digitalizacion en 1 daw mañana
        {
          idTeacher: 1,
          idSubject: 16,
          idGroup: 1,
          schoolYear: acaYear
        },

        //profesor 11 da implantaciond e sitemas operativos en 1 asir mañana
        {
          idTeacher: 11,
          idSubject: 17,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 12 da planificacion y administracion de redes en 1 asir mañana
        {
          idTeacher: 12,
          idSubject: 18,
          idGroup: 1,
          schoolYear: acaYear
        },

        //profresor 13 da fundamentos del hardware en 1 asir mañana
        {
          idTeacher: 13,
          idSubject: 19,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 4 da lenguaje de marcas en 1 asir mañana(bajas)
        {
          idTeacher: 4,
          idSubject: 20,
          idGroup: 1,
          schoolYear: acaYear
        },

        //profesor 14 da gestion de base de datos 1 asir mañana
        {
          idTeacher: 14,
          idSubject: 21,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 6 da ipe en 1 asir mañana
        {
          idTeacher: 6,
          idSubject: 22,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 7 da sostenibilidad en 1 asir mañana
        {
          idTeacher: 7,
          idSubject: 23,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 4 da digitalizacion en 1 asir mañana
        {
          idTeacher: 4,
          idSubject: 24,
          idGroup: 1,
          schoolYear: acaYear
        },
        //SMR
        //profesor 15 da aplicaciones ofimaticas en 1 smr mañana
        {
          idTeacher: 15,
          idSubject: 25,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 13 da montaje y mantenimiento de equipos 1 smr mañana
        {
          idTeacher: 13,
          idSubject: 26,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 12 da redes locales en 1 smr mañana
        {
          idTeacher: 12,
          idSubject: 27,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 11 da sistemas operativos en 1 smr mañana
        {
          idTeacher: 11,
          idSubject: 28,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 6 da ipe en 1 smr de mañana
        {
          idTeacher: 6,
          idSubject: 29,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 7 da sostenibilidad 1 smr mañana
        {
          idTeacher: 7,
          idSubject: 30,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 3 da digitalizacion 1 smr mañana
        {
          idTeacher: 3,
          idSubject: 31,
          idGroup: 1,
          schoolYear: acaYear
        },
        //grupos tarde
        //DAM
        //profesor 16 da programación en dam tarde
        {
          idTeacher: 16,
          idSubject: 1,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 14 base de datos dam tarde
        {
          idTeacher: 14,
          idSubject: 2,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 13 da sistemas informáticos en dam tarde
        {
          idTeacher: 13,
          idSubject: 3,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 18 da lenguaje de marcas dam tarde
        {
          idTeacher: 18,
          idSubject: 4,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 5 da EDES en dam tarde
        {
          idTeacher: 5,
          idSubject: 5,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 17 da ipe en dam tarde
        {
          idTeacher: 17,
          idSubject: 6,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 7 da sotenibilidad en dam tarde
        {
          idTeacher: 7,
          idSubject: 7,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 18 da digitalizacion en dam tarde
        {
          idTeacher: 18,
          idSubject: 8,
          idGroup: 2,
          schoolYear: acaYear
        },
        //DAW
        //profesor 15 da programaciçon en daw tarde
        {
          idTeacher: 15,
          idSubject: 9,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 30 da base de datos daw tarde
        {
          idTeacher: 30,
          idSubject: 10,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor  15 da sistemas informaticos en daw tarde
        {
          idTeacher: 15,
          idSubject: 11,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 10 da lenguaje de marcas en daw tarde
        {
          idTeacher: 10,
          idSubject: 12,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 16 da edes en daw tarde
        {
          idTeacher: 16,
          idSubject: 13,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 31 da ipe en daw tarde
        {
          idTeacher: 31,
          idSubject: 14,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 20 da sostenibilidad daw tarde
        {
          idTeacher: 20,
          idSubject: 15,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 4 da digitalizacion en daw tarde
        {
          idTeacher: 4,
          idSubject: 16,
          idGroup: 2,
          schoolYear: acaYear
        },


        //IT MAÑANA
        //profesor 19 da infraestructuras telecomunicacion en 1 it mañana
        {
          idTeacher: 19,
          idSubject: 32,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 21 da electronica aplicada en 1 it mañana
        {
          idTeacher: 21,
          idSubject: 33,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 22 da equipos microinformaticos en 1 it mañana
        {
          idTeacher: 22,
          idSubject: 34,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 25 da infraestructuras redes en 1 it mañana
        {
          idTeacher: 25,
          idSubject: 35,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 26 da instalaciones electricas en 1 it mañana
        {
          idTeacher: 26,
          idSubject: 36,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 17 da ipe en 1 it mañana
        {
          idTeacher: 17,
          idSubject: 37,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 7 da sostenibilidad en 1 it mañana
        {
          idTeacher: 7,
          idSubject: 38,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 28 da digitalizacion en 1 it mañana
        {
          idTeacher: 28,
          idSubject: 39,
          idGroup: 1,
          schoolYear: acaYear
        },
        //ME MAÑANA
        //profesor 23 da circuitos analogicos en 1 me mañana
        {
          idTeacher: 23,
          idSubject: 40,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 24 da equipos programables en 1 me mañana
        {
          idTeacher: 24,
          idSubject: 41,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 29 da mantenimiento voz y datos en 1 me mañana
        {
          idTeacher: 29,
          idSubject: 42,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 27 da montaje equipos electronicos en 1 me mañana
        {
          idTeacher: 27,
          idSubject: 43,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 26 da infraestructuras mantenimiento en 1 me mañana
        {
          idTeacher: 26,
          idSubject: 44,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 17 da ipe en 1 me mañana
        {
          idTeacher: 17,
          idSubject: 45,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 7 da sostenibilidad en 1 me mañana
        {
          idTeacher: 7,
          idSubject: 46,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 28 da digitalizacion en 1 me mañana
        {
          idTeacher: 28,
          idSubject: 47,
          idGroup: 1,
          schoolYear: acaYear
        },
        //DAM 2 MAÑANA
        //profesor 2 da acceso a datos en 2 dam mañana
        {
          idTeacher: 2,
          idSubject: 48,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 8 da desarrollo interfaces en 2 dam mañana
        {
          idTeacher: 8,
          idSubject: 49,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 1 da programacion multimedia en 2 dam mañana
        {
          idTeacher: 1,
          idSubject: 50,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 5 da programacion servicios en 2 dam mañana
        {
          idTeacher: 5,
          idSubject: 51,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 14 da sistemas gestion empresarial en 2 dam mañana
        {
          idTeacher: 14,
          idSubject: 52,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 6 da ipe ii en 2 dam mañana
        {
          idTeacher: 6,
          idSubject: 53,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 3 da optativa en 2 dam mañana
        {
          idTeacher: 3,
          idSubject: 54,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 18 da proyecto intermodular en 2 dam mañana
        {
          idTeacher: 18,
          idSubject: 55,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 21 da ingles en 2 dam mañana
        {
          idTeacher: 21,
          idSubject: 56,
          idGroup: 1,
          schoolYear: acaYear
        },
        //DAM TARDE
        //profesor 16 da acceso a datos en 2 dam tarde
        {
          idTeacher: 16,
          idSubject: 48,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 14 da desarrollo interfaces en 2 dam tarde
        {
          idTeacher: 14,
          idSubject: 49,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 15 da programacion multimedia en 2 dam tarde
        {
          idTeacher: 15,
          idSubject: 50,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 5 da programacion servicios en 2 dam tarde
        {
          idTeacher: 5,
          idSubject: 51,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 13 da sistemas gestion empresarial en 2 dam tarde
        {
          idTeacher: 13,
          idSubject: 52,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 6 da ipe ii en 2 dam tarde
        {
          idTeacher: 6,
          idSubject: 53,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 2 da optativa en 2 dam tarde
        {
          idTeacher: 2,
          idSubject: 54,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 18 da proyecto intermodular en 2 dam tarde
        {
          idTeacher: 18,
          idSubject: 55,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 22 da ingles en 2 dam tarde
        {
          idTeacher: 22,
          idSubject: 56,
          idGroup: 2,
          schoolYear: acaYear
        },
        //DAW 2 MAÑANA
        //profesor 1 da desarrollo web cliente en 2 daw mañana
        {
          idTeacher: 1,
          idSubject: 57,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 16 da desarrollo web servidor en 2 daw mañana
        {
          idTeacher: 16,
          idSubject: 58,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 16 da despliegue aplicaciones web en 2 daw mañana
        {
          idTeacher: 16,
          idSubject: 59,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 10 da diseño interfaces web en 2 daw mañana
        {
          idTeacher: 10,
          idSubject: 60,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 20 da ipe ii en 2 daw mañana
        {
          idTeacher: 20,
          idSubject: 61,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 9 da optativa en 2 daw mañana
        {
          idTeacher: 9,
          idSubject: 62,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 15 da proyecto intermodular en 2 daw mañana
        {
          idTeacher: 15,
          idSubject: 63,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 21 da ingles en 2 daw mañana
        {
          idTeacher: 21,
          idSubject: 64,
          idGroup: 1,
          schoolYear: acaYear
        },
        //DAW TARDE
        //profesor 15 da desarrollo web cliente en 2 daw tarde
        {
          idTeacher: 15,
          idSubject: 57,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 18 da desarrollo web servidor en 2 daw tarde
        {
          idTeacher: 18,
          idSubject: 58,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 16 da despliegue aplicaciones web en 2 daw tarde
        {
          idTeacher: 16,
          idSubject: 59,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 10 da diseño interfaces web en 2 daw tarde
        {
          idTeacher: 10,
          idSubject: 60,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 17 da ipe ii en 2 daw tarde
        {
          idTeacher: 17,
          idSubject: 61,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 9 da optativa en 2 daw tarde
        {
          idTeacher: 9,
          idSubject: 62,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 13 da proyecto intermodular en 2 daw tarde
        {
          idTeacher: 13,
          idSubject: 63,
          idGroup: 2,
          schoolYear: acaYear
        },
        //profesor 22 da ingles en 2 daw tarde
        {
          idTeacher: 22,
          idSubject: 64,
          idGroup: 2,
          schoolYear: acaYear
        },
        //ASIR 2 MAÑANA
        //profesor 22 da administracion sistemas operativos en 2 asir mañana
        {
          idTeacher: 22,
          idSubject: 65,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 2 da servicios red en 2 asir mañana
        {
          idTeacher: 2,
          idSubject: 66,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 7 da implantacion aplicaciones web en 2 asir mañana
        {
          idTeacher: 7,
          idSubject: 67,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 3 da administracion sgbd en 2 asir mañana
        {
          idTeacher: 3,
          idSubject: 68,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 2 da seguridad alta disponibilidad en 2 asir mañana
        {
          idTeacher: 2,
          idSubject: 69,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 20 da ipe ii en 2 asir mañana
        {
          idTeacher: 20,
          idSubject: 70,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 4 da optativa en 2 asir mañana
        {
          idTeacher: 4,
          idSubject: 71,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 21 da proyecto intermodular en 2 asir mañana
        {
          idTeacher: 21,
          idSubject: 72,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 22 da ingles en 2 asir mañana
        {
          idTeacher: 22,
          idSubject: 73,
          idGroup: 1,
          schoolYear: acaYear
        },
        //SMR 2 MAÑANA
        //profesor 6 da aplicaciones web en 2 smr mañana
        {
          idTeacher: 6,
          idSubject: 74,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 13 da seguridad informatica en 2 smr mañana
        {
          idTeacher: 13,
          idSubject: 75,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 14 da servicios en red en 2 smr mañana
        {
          idTeacher: 14,
          idSubject: 76,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 7 da sistemas operativos en red en 2 smr mañana
        {
          idTeacher: 7,
          idSubject: 77,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 20 da ipe ii en 2 smr mañana
        {
          idTeacher: 20,
          idSubject: 78,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 5 da optativa en 2 smr mañana
        {
          idTeacher: 5,
          idSubject: 79,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 18 da proyecto intermodular en 2 smr mañana
        {
          idTeacher: 18,
          idSubject: 80,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 22 da ingles en 2 smr mañana
        {
          idTeacher: 22,
          idSubject: 81,
          idGroup: 1,
          schoolYear: acaYear
        },
        //IT 2 MAÑANA
        //profesor 19 da instalaciones domoticas en 2 it mañana
        {
          idTeacher: 19,
          idSubject: 82,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 23 da megafonia en 2 it mañana
        {
          idTeacher: 23,
          idSubject: 83,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 22 da cctv en 2 it mañana
        {
          idTeacher: 22,
          idSubject: 84,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 25 da telefonia en 2 it mañana
        {
          idTeacher: 25,
          idSubject: 85,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 20 da ipe ii en 2 it mañana
        {
          idTeacher: 20,
          idSubject: 86,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 5 da optativa en 2 it mañana
        {
          idTeacher: 5,
          idSubject: 87,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 28 da proyecto intermodular en 2 it mañana
        {
          idTeacher: 28,
          idSubject: 88,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 29 da ingles en 2 it mañana
        {
          idTeacher: 29,
          idSubject: 89,
          idGroup: 1,
          schoolYear: acaYear
        },
        //ME 2 MAÑANA
        //profesor 3 da configuracion mecatronica en 2 me mañana
        {
          idTeacher: 3,
          idSubject: 90,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 4 da maquinas electricas en 2 me mañana
        {
          idTeacher: 4,
          idSubject: 91,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 27 da instalaciones frio en 2 me mañana
        {
          idTeacher: 27,
          idSubject: 92,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 26 da mantenimiento industrial en 2 me mañana
        {
          idTeacher: 26,
          idSubject: 93,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 20 da ipe ii en 2 me mañana
        {
          idTeacher: 20,
          idSubject: 94,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 8 da optativa en 2 me mañana
        {
          idTeacher: 8,
          idSubject: 95,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 28 da proyecto intermodular en 2 me mañana
        {
          idTeacher: 28,
          idSubject: 96,
          idGroup: 1,
          schoolYear: acaYear
        },
        //profesor 29 da ingles en 2 me mañana
        {
          idTeacher: 29,
          idSubject: 97,
          idGroup: 1,
          schoolYear: acaYear
        },

      ]
    });

  // El informe de uso (usage_report.py) filtra asignaciones ACTIVE; el default del schema es STANDBY.
  await prisma.teacherOnSubjectOnGroup.updateMany({
    where: { schoolYear: acaYear },
    data: { status: 'ACTIVE' },
  });
  // Mantener 2 STANDBY con horario/sesiones/tareas para la hoja Anomalias del informe.
  await prisma.teacherOnSubjectOnGroup.updateMany({
    where: { id: { in: [129, 130] } },
    data: { status: 'STANDBY' },
  });

    //Creando horarios
    console.log('Creando Horarios...');

    const assignmentsForWeekLabels = await prisma.teacherOnSubjectOnGroup.findMany({
      include: {
        subject: { include: { course: true } },
        group: true,
      },
    });
    const labelByAssignmentId = new Map(
      assignmentsForWeekLabels.map((a) => [
        a.id,
        buildClassLabelFromAssignment(a),
      ]),
    );
    const hazLabel = (idTeacherAssignment: number): string => {
      const label = labelByAssignmentId.get(idTeacherAssignment);
      if (label === undefined) {
        throw new Error(
          `seed: idTeacherAssignment ${idTeacherAssignment} sin assignment (label no calculable)`,
        );
      }
      return label;
    };

  const weekSchedule = await
    prisma.weekSchedule.createMany({
      data: [
        //una clase por ejemplo 1 dam mañana
        //un lunes 
        {
          idTeacherAssignment: 1,
          label: hazLabel(1),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 1,
          label: hazLabel(1),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 2,
          label: hazLabel(2),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 2,
          label: hazLabel(2),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 3,
          label: hazLabel(3),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 3,
          label: hazLabel(3),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
        //un martes
        {
          idTeacherAssignment: 2,
          label: hazLabel(2),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 2,
          label: hazLabel(2),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 2,
          label: hazLabel(2),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 6,
          label: hazLabel(6),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 6,
          label: hazLabel(6),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 6,
          label: hazLabel(6),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
        //un miercoles
        {
          idTeacherAssignment: 2,
          label: hazLabel(2),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 4,
          label: hazLabel(4),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 1,
          label: hazLabel(1),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 1,
          label: hazLabel(1),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 1,
          label: hazLabel(1),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 8,
          label: hazLabel(8),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
        //un jueves
        {
          idTeacherAssignment: 7,
          label: hazLabel(7),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 4,
          label: hazLabel(4),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 4,
          label: hazLabel(4),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 5,
          label: hazLabel(5),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 5,
          label: hazLabel(5),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 5,
          label: hazLabel(5),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
        //un viernes
        {
          idTeacherAssignment: 1,
          label: hazLabel(1),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 1,
          label: hazLabel(1),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 1,
          label: hazLabel(1),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 3,
          label: hazLabel(3),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 3,
          label: hazLabel(3),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 3,
          label: hazLabel(3),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
        // 1 DAM TARDE 
        {
          idTeacherAssignment: 32,
          label: hazLabel(32),
          weekDay: 'MONDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 32,
          label: hazLabel(32),
          weekDay: 'MONDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 33,
          label: hazLabel(33),
          weekDay: 'MONDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 34,
          label: hazLabel(34),
          weekDay: 'MONDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 37,
          label: hazLabel(37),
          weekDay: 'MONDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 39,
          label: hazLabel(39),
          weekDay: 'MONDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

        {
          idTeacherAssignment: 32,
          label: hazLabel(32),
          weekDay: 'TUESDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 33,
          label: hazLabel(33),
          weekDay: 'TUESDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 33,
          label: hazLabel(33),
          weekDay: 'TUESDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 34,
          label: hazLabel(34),
          weekDay: 'TUESDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 35,
          label: hazLabel(35),
          weekDay: 'TUESDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 38,
          label: hazLabel(38),
          weekDay: 'TUESDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

        {
          idTeacherAssignment: 32,
          label: hazLabel(32),
          weekDay: 'WEDNESDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 32,
          label: hazLabel(32),
          weekDay: 'WEDNESDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 33,
          label: hazLabel(33),
          weekDay: 'WEDNESDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 34,
          label: hazLabel(34),
          weekDay: 'WEDNESDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 35,
          label: hazLabel(35),
          weekDay: 'WEDNESDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 36,
          label: hazLabel(36),
          weekDay: 'WEDNESDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

        {
          idTeacherAssignment: 32,
          label: hazLabel(32),
          weekDay: 'THURSDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 33,
          label: hazLabel(33),
          weekDay: 'THURSDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 34,
          label: hazLabel(34),
          weekDay: 'THURSDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 35,
          label: hazLabel(35),
          weekDay: 'THURSDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 36,
          label: hazLabel(36),
          weekDay: 'THURSDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 37,
          label: hazLabel(37),
          weekDay: 'THURSDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

        {
          idTeacherAssignment: 32,
          label: hazLabel(32),
          weekDay: 'FRIDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 32,
          label: hazLabel(32),
          weekDay: 'FRIDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 33,
          label: hazLabel(33),
          weekDay: 'FRIDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 34,
          label: hazLabel(34),
          weekDay: 'FRIDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 36,
          label: hazLabel(36),
          weekDay: 'FRIDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 37,
          label: hazLabel(37),
          weekDay: 'FRIDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //ahora el horario de otra clase (por ejemplo 1 daw mañana)
          //un lunes
        {
          idTeacherAssignment: 9,
          label: hazLabel(9),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 9,
          label: hazLabel(9),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 10,
          label: hazLabel(10),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 10,
          label: hazLabel(10),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 11,
          label: hazLabel(11),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 11,
          label: hazLabel(11),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
          //un martes
        {
          idTeacherAssignment: 10,
          label: hazLabel(10),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 10,
          label: hazLabel(10),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 10,
          label: hazLabel(10),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 14,
          label: hazLabel(14),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 14,
          label: hazLabel(14),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 14,
          label: hazLabel(14),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
          //un miercoles
        {
          idTeacherAssignment: 10,
          label: hazLabel(10),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 12,
          label: hazLabel(12),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 9,
          label: hazLabel(9),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 9,
          label: hazLabel(9),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 9,
          label: hazLabel(9),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 16,
          label: hazLabel(16),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
          //un jueves
        {
          idTeacherAssignment: 15,
          label: hazLabel(15),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 12,
          label: hazLabel(12),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 12,
          label: hazLabel(12),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 13,
          label: hazLabel(13),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 13,
          label: hazLabel(13),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 13,
          label: hazLabel(13),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
          //un viernes
        {
          idTeacherAssignment: 9,
          label: hazLabel(9),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 9,
          label: hazLabel(9),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 9,
          label: hazLabel(9),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 11,
          label: hazLabel(11),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 11,
          label: hazLabel(11),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 11,
          label: hazLabel(11),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
          //ahora el horario semanal que corresponderá a otra clase ejemplo(1 asir mañana)
          //un lunes
        {
          idTeacherAssignment: 20,
          label: hazLabel(20),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 18,
          label: hazLabel(18),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 18,
          label: hazLabel(18),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 17,
          label: hazLabel(17),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 17,
          label: hazLabel(17),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 17,
          label: hazLabel(17),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 21,
          label: hazLabel(21),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 19,
          label: hazLabel(19),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 17,
          label: hazLabel(17),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 18,
          label: hazLabel(18),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 21,
          label: hazLabel(21),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 19,
          label: hazLabel(19),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 22,
          label: hazLabel(22),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 22,
          label: hazLabel(22),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 21,
          label: hazLabel(21),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 17,
          label: hazLabel(17),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 20,
          label: hazLabel(20),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 21,
          label: hazLabel(21),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 17,
          label: hazLabel(17),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 21,
          label: hazLabel(21),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 17,
          label: hazLabel(17),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 18,
          label: hazLabel(18),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 20,
          label: hazLabel(20),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 21,
          label: hazLabel(21),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 22,
          label: hazLabel(22),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 18,
          label: hazLabel(18),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 24,
          label: hazLabel(24),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 19,
          label: hazLabel(19),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 23,
          label: hazLabel(23),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 18,
          label: hazLabel(18),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
//ahora el horario semanal que corresponderá a otra clase 1smr mañana
          //un lunes
        {
          idTeacherAssignment: 25,
          label: hazLabel(25),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 25,
          label: hazLabel(25),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 25,
          label: hazLabel(25),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 27,
          label: hazLabel(27),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 26,
          label: hazLabel(26),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 27,
          label: hazLabel(27),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 28,
          label: hazLabel(28),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 28,
          label: hazLabel(28),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 26,
          label: hazLabel(26),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 30,
          label: hazLabel(30),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 26,
          label: hazLabel(26),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 28,
          label: hazLabel(28),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 26,
          label: hazLabel(26),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 27,
          label: hazLabel(27),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 29,
          label: hazLabel(29),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 26,
          label: hazLabel(26),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 28,
          label: hazLabel(28),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 29,
          label: hazLabel(29),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 31,
          label: hazLabel(31),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 27,
          label: hazLabel(27),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 29,
          label: hazLabel(29),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 28,
          label: hazLabel(28),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 25,
          label: hazLabel(25),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 27,
          label: hazLabel(27),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 25,
          label: hazLabel(25),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 25,
          label: hazLabel(25),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 27,
          label: hazLabel(27),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 25,
          label: hazLabel(25),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 27,
          label: hazLabel(27),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 26,
          label: hazLabel(26),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
//1 DAW TARDE
          //un lunes
        {
          idTeacherAssignment: 40,
          label: hazLabel(40),
          weekDay: 'MONDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 40,
          label: hazLabel(40),
          weekDay: 'MONDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 41,
          label: hazLabel(41),
          weekDay: 'MONDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 42,
          label: hazLabel(42),
          weekDay: 'MONDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 45,
          label: hazLabel(45),
          weekDay: 'MONDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 47,
          label: hazLabel(47),
          weekDay: 'MONDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },
          //un martes
        {
          idTeacherAssignment: 40,
          label: hazLabel(40),
          weekDay: 'TUESDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 41,
          label: hazLabel(41),
          weekDay: 'TUESDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 41,
          label: hazLabel(41),
          weekDay: 'TUESDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 42,
          label: hazLabel(42),
          weekDay: 'TUESDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 43,
          label: hazLabel(43),
          weekDay: 'TUESDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 46,
          label: hazLabel(46),
          weekDay: 'TUESDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },
          //un miercoles
        {
          idTeacherAssignment: 40,
          label: hazLabel(40),
          weekDay: 'WEDNESDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 40,
          label: hazLabel(40),
          weekDay: 'WEDNESDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 41,
          label: hazLabel(41),
          weekDay: 'WEDNESDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 42,
          label: hazLabel(42),
          weekDay: 'WEDNESDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 43,
          label: hazLabel(43),
          weekDay: 'WEDNESDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 44,
          label: hazLabel(44),
          weekDay: 'WEDNESDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },
          //un jueves
        {
          idTeacherAssignment: 40,
          label: hazLabel(40),
          weekDay: 'THURSDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 41,
          label: hazLabel(41),
          weekDay: 'THURSDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 42,
          label: hazLabel(42),
          weekDay: 'THURSDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 43,
          label: hazLabel(43),
          weekDay: 'THURSDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 44,
          label: hazLabel(44),
          weekDay: 'THURSDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 45,
          label: hazLabel(45),
          weekDay: 'THURSDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },
          //un viernes
        {
          idTeacherAssignment: 40,
          label: hazLabel(40),
          weekDay: 'FRIDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 40,
          label: hazLabel(40),
          weekDay: 'FRIDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 41,
          label: hazLabel(41),
          weekDay: 'FRIDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 42,
          label: hazLabel(42),
          weekDay: 'FRIDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 44,
          label: hazLabel(44),
          weekDay: 'FRIDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 45,
          label: hazLabel(45),
          weekDay: 'FRIDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //1 IT MAÑANA
          //un lunes
        {
          idTeacherAssignment: 48,
          label: hazLabel(48),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 49,
          label: hazLabel(49),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 50,
          label: hazLabel(50),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 51,
          label: hazLabel(51),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 52,
          label: hazLabel(52),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 53,
          label: hazLabel(53),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 54,
          label: hazLabel(54),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 55,
          label: hazLabel(55),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 48,
          label: hazLabel(48),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 49,
          label: hazLabel(49),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 50,
          label: hazLabel(50),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 51,
          label: hazLabel(51),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 52,
          label: hazLabel(52),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 53,
          label: hazLabel(53),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 48,
          label: hazLabel(48),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 49,
          label: hazLabel(49),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 50,
          label: hazLabel(50),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 51,
          label: hazLabel(51),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 52,
          label: hazLabel(52),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 53,
          label: hazLabel(53),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 48,
          label: hazLabel(48),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 49,
          label: hazLabel(49),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 50,
          label: hazLabel(50),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 51,
          label: hazLabel(51),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 52,
          label: hazLabel(52),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 49,
          label: hazLabel(49),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 51,
          label: hazLabel(51),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 52,
          label: hazLabel(52),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 49,
          label: hazLabel(49),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 51,
          label: hazLabel(51),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
//1 ME MAÑANA
          //un lunes
        {
          idTeacherAssignment: 56,
          label: hazLabel(56),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 57,
          label: hazLabel(57),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 58,
          label: hazLabel(58),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 59,
          label: hazLabel(59),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 61,
          label: hazLabel(61),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 60,
          label: hazLabel(60),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 63,
          label: hazLabel(63),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 62,
          label: hazLabel(62),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 56,
          label: hazLabel(56),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 57,
          label: hazLabel(57),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 58,
          label: hazLabel(58),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 59,
          label: hazLabel(59),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 61,
          label: hazLabel(61),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 60,
          label: hazLabel(60),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 56,
          label: hazLabel(56),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 57,
          label: hazLabel(57),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 58,
          label: hazLabel(58),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 59,
          label: hazLabel(59),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 61,
          label: hazLabel(61),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 56,
          label: hazLabel(56),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 57,
          label: hazLabel(57),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 58,
          label: hazLabel(58),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 59,
          label: hazLabel(59),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 56,
          label: hazLabel(56),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 57,
          label: hazLabel(57),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 58,
          label: hazLabel(58),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 59,
          label: hazLabel(59),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 56,
          label: hazLabel(56),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 57,
          label: hazLabel(57),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 56,
          label: hazLabel(56),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
//2 DAM MAÑANA
          //un lunes
        {
          idTeacherAssignment: 64,
          label: hazLabel(64),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 67,
          label: hazLabel(67),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 65,
          label: hazLabel(65),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 66,
          label: hazLabel(66),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 68,
          label: hazLabel(68),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 69,
          label: hazLabel(69),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 70,
          label: hazLabel(70),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 71,
          label: hazLabel(71),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 72,
          label: hazLabel(72),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 64,
          label: hazLabel(64),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 65,
          label: hazLabel(65),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 66,
          label: hazLabel(66),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 67,
          label: hazLabel(67),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 68,
          label: hazLabel(68),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 70,
          label: hazLabel(70),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 69,
          label: hazLabel(69),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 71,
          label: hazLabel(71),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 72,
          label: hazLabel(72),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 64,
          label: hazLabel(64),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 65,
          label: hazLabel(65),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 66,
          label: hazLabel(66),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 68,
          label: hazLabel(68),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 69,
          label: hazLabel(69),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 70,
          label: hazLabel(70),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 67,
          label: hazLabel(67),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 64,
          label: hazLabel(64),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 68,
          label: hazLabel(68),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 65,
          label: hazLabel(65),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 65,
          label: hazLabel(65),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 65,
          label: hazLabel(65),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
//2 DAM TARDE
          //un lunes
        {
          idTeacherAssignment: 74,
          label: hazLabel(74),
          weekDay: 'MONDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 74,
          label: hazLabel(74),
          weekDay: 'MONDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 77,
          label: hazLabel(77),
          weekDay: 'MONDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 74,
          label: hazLabel(74),
          weekDay: 'MONDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 73,
          label: hazLabel(73),
          weekDay: 'MONDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 79,
          label: hazLabel(79),
          weekDay: 'MONDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //un martes
        {
          idTeacherAssignment: 78,
          label: hazLabel(78),
          weekDay: 'TUESDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 77,
          label: hazLabel(77),
          weekDay: 'TUESDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 76,
          label: hazLabel(76),
          weekDay: 'TUESDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 74,
          label: hazLabel(74),
          weekDay: 'TUESDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 75,
          label: hazLabel(75),
          weekDay: 'TUESDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 73,
          label: hazLabel(73),
          weekDay: 'TUESDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //un miercoles
        {
          idTeacherAssignment: 81,
          label: hazLabel(81),
          weekDay: 'WEDNESDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 80,
          label: hazLabel(80),
          weekDay: 'WEDNESDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 79,
          label: hazLabel(79),
          weekDay: 'WEDNESDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 78,
          label: hazLabel(78),
          weekDay: 'WEDNESDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 77,
          label: hazLabel(77),
          weekDay: 'WEDNESDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 75,
          label: hazLabel(75),
          weekDay: 'WEDNESDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //un jueves
        {
          idTeacherAssignment: 76,
          label: hazLabel(76),
          weekDay: 'THURSDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 73,
          label: hazLabel(73),
          weekDay: 'THURSDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 74,
          label: hazLabel(74),
          weekDay: 'THURSDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 81,
          label: hazLabel(81),
          weekDay: 'THURSDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 80,
          label: hazLabel(80),
          weekDay: 'THURSDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 79,
          label: hazLabel(79),
          weekDay: 'THURSDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //un viernes
        {
          idTeacherAssignment: 78,
          label: hazLabel(78),
          weekDay: 'FRIDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 77,
          label: hazLabel(77),
          weekDay: 'FRIDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 76,
          label: hazLabel(76),
          weekDay: 'FRIDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 74,
          label: hazLabel(74),
          weekDay: 'FRIDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 75,
          label: hazLabel(75),
          weekDay: 'FRIDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 73,
          label: hazLabel(73),
          weekDay: 'FRIDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },
//2 DAW MAÑANA
          //un lunes
        {
          idTeacherAssignment: 83,
          label: hazLabel(83),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 83,
          label: hazLabel(83),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 82,
          label: hazLabel(82),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 85,
          label: hazLabel(85),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 83,
          label: hazLabel(83),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 82,
          label: hazLabel(82),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 85,
          label: hazLabel(85),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 83,
          label: hazLabel(83),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 82,
          label: hazLabel(82),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 87,
          label: hazLabel(87),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 86,
          label: hazLabel(86),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 85,
          label: hazLabel(85),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 83,
          label: hazLabel(83),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 82,
          label: hazLabel(82),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 89,
          label: hazLabel(89),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 88,
          label: hazLabel(88),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 87,
          label: hazLabel(87),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 86,
          label: hazLabel(86),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 85,
          label: hazLabel(85),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 84,
          label: hazLabel(84),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 83,
          label: hazLabel(83),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 82,
          label: hazLabel(82),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 89,
          label: hazLabel(89),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 88,
          label: hazLabel(88),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 87,
          label: hazLabel(87),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 86,
          label: hazLabel(86),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 85,
          label: hazLabel(85),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 84,
          label: hazLabel(84),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 83,
          label: hazLabel(83),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 82,
          label: hazLabel(82),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
//2 DAW TARDE
          //un lunes
        {
          idTeacherAssignment: 91,
          label: hazLabel(91),
          weekDay: 'MONDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 93,
          label: hazLabel(93),
          weekDay: 'MONDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 90,
          label: hazLabel(90),
          weekDay: 'MONDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 92,
          label: hazLabel(92),
          weekDay: 'MONDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 95,
          label: hazLabel(95),
          weekDay: 'MONDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 94,
          label: hazLabel(94),
          weekDay: 'MONDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //un martes
        {
          idTeacherAssignment: 96,
          label: hazLabel(96),
          weekDay: 'TUESDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 97,
          label: hazLabel(97),
          weekDay: 'TUESDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 90,
          label: hazLabel(90),
          weekDay: 'TUESDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 91,
          label: hazLabel(91),
          weekDay: 'TUESDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 92,
          label: hazLabel(92),
          weekDay: 'TUESDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 93,
          label: hazLabel(93),
          weekDay: 'TUESDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //un miercoles
        {
          idTeacherAssignment: 94,
          label: hazLabel(94),
          weekDay: 'WEDNESDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 95,
          label: hazLabel(95),
          weekDay: 'WEDNESDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 96,
          label: hazLabel(96),
          weekDay: 'WEDNESDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 97,
          label: hazLabel(97),
          weekDay: 'WEDNESDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 90,
          label: hazLabel(90),
          weekDay: 'WEDNESDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 91,
          label: hazLabel(91),
          weekDay: 'WEDNESDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //un jueves
        {
          idTeacherAssignment: 93,
          label: hazLabel(93),
          weekDay: 'THURSDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 94,
          label: hazLabel(94),
          weekDay: 'THURSDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 95,
          label: hazLabel(95),
          weekDay: 'THURSDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 90,
          label: hazLabel(90),
          weekDay: 'THURSDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 93,
          label: hazLabel(93),
          weekDay: 'THURSDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 91,
          label: hazLabel(91),
          weekDay: 'THURSDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },

          //un viernes
        {
          idTeacherAssignment: 91,
          label: hazLabel(91),
          weekDay: 'FRIDAY',
          startTime: '15:15',
          finishTime: '16:15',
        },
        {
          idTeacherAssignment: 93,
          label: hazLabel(93),
          weekDay: 'FRIDAY',
          startTime: '16:15',
          finishTime: '17:15',
        },
        {
          idTeacherAssignment: 90,
          label: hazLabel(90),
          weekDay: 'FRIDAY',
          startTime: '17:15',
          finishTime: '18:15',
        },
        {
          idTeacherAssignment: 91,
          label: hazLabel(91),
          weekDay: 'FRIDAY',
          startTime: '18:30',
          finishTime: '19:30',
        },
        {
          idTeacherAssignment: 91,
          label: hazLabel(91),
          weekDay: 'FRIDAY',
          startTime: '19:30',
          finishTime: '20:30',
        },
        {
          idTeacherAssignment: 90,
          label: hazLabel(90),
          weekDay: 'FRIDAY',
          startTime: '20:30',
          finishTime: '21:30',
        },
//2 ASIR MAÑANA
          //un lunes
        {
          idTeacherAssignment: 98,
          label: hazLabel(98),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 99,
          label: hazLabel(99),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 100,
          label: hazLabel(100),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 101,
          label: hazLabel(101),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 102,
          label: hazLabel(102),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 103,
          label: hazLabel(103),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 104,
          label: hazLabel(104),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 105,
          label: hazLabel(105),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 106,
          label: hazLabel(106),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 98,
          label: hazLabel(98),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 99,
          label: hazLabel(99),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 100,
          label: hazLabel(100),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 101,
          label: hazLabel(101),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 102,
          label: hazLabel(102),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 103,
          label: hazLabel(103),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 104,
          label: hazLabel(104),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 105,
          label: hazLabel(105),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 106,
          label: hazLabel(106),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 98,
          label: hazLabel(98),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 99,
          label: hazLabel(99),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 100,
          label: hazLabel(100),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 101,
          label: hazLabel(101),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 102,
          label: hazLabel(102),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 103,
          label: hazLabel(103),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 104,
          label: hazLabel(104),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 98,
          label: hazLabel(98),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 99,
          label: hazLabel(99),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 100,
          label: hazLabel(100),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 98,
          label: hazLabel(98),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 99,
          label: hazLabel(99),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
//2 SMR MAÑANA
          //un lunes
        {
          idTeacherAssignment: 107,
          label: hazLabel(107),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 108,
          label: hazLabel(108),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 109,
          label: hazLabel(109),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 110,
          label: hazLabel(110),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 111,
          label: hazLabel(111),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 112,
          label: hazLabel(112),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 113,
          label: hazLabel(113),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 114,
          label: hazLabel(114),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 107,
          label: hazLabel(107),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 108,
          label: hazLabel(108),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 110,
          label: hazLabel(110),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 109,
          label: hazLabel(109),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 111,
          label: hazLabel(111),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 112,
          label: hazLabel(112),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 113,
          label: hazLabel(113),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 114,
          label: hazLabel(114),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 107,
          label: hazLabel(107),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 108,
          label: hazLabel(108),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 109,
          label: hazLabel(109),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 110,
          label: hazLabel(110),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 111,
          label: hazLabel(111),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 107,
          label: hazLabel(107),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 109,
          label: hazLabel(109),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 108,
          label: hazLabel(108),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 110,
          label: hazLabel(110),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 112,
          label: hazLabel(112),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 110,
          label: hazLabel(110),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 109,
          label: hazLabel(109),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 109,
          label: hazLabel(109),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 110,
          label: hazLabel(110),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
//2 IT MAÑANA
          //un lunes
        {
          idTeacherAssignment: 118,
          label: hazLabel(118),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 117,
          label: hazLabel(117),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 116,
          label: hazLabel(116),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 115,
          label: hazLabel(115),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 118,
          label: hazLabel(118),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 117,
          label: hazLabel(117),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 116,
          label: hazLabel(116),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 115,
          label: hazLabel(115),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 120,
          label: hazLabel(120),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 119,
          label: hazLabel(119),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 118,
          label: hazLabel(118),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 117,
          label: hazLabel(117),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 116,
          label: hazLabel(116),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 115,
          label: hazLabel(115),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 122,
          label: hazLabel(122),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 121,
          label: hazLabel(121),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 119,
          label: hazLabel(119),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 120,
          label: hazLabel(120),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 118,
          label: hazLabel(118),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 117,
          label: hazLabel(117),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 116,
          label: hazLabel(116),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 115,
          label: hazLabel(115),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 122,
          label: hazLabel(122),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 121,
          label: hazLabel(121),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 119,
          label: hazLabel(119),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 118,
          label: hazLabel(118),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 120,
          label: hazLabel(120),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 117,
          label: hazLabel(117),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 116,
          label: hazLabel(116),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 115,
          label: hazLabel(115),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },
//2 ME MAÑANA
          //un lunes
        {
          idTeacherAssignment: 123,
          label: hazLabel(123),
          weekDay: 'MONDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 124,
          label: hazLabel(124),
          weekDay: 'MONDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 125,
          label: hazLabel(125),
          weekDay: 'MONDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 126,
          label: hazLabel(126),
          weekDay: 'MONDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 128,
          label: hazLabel(128),
          weekDay: 'MONDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 129,
          label: hazLabel(129),
          weekDay: 'MONDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un martes
        {
          idTeacherAssignment: 127,
          label: hazLabel(127),
          weekDay: 'TUESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 130,
          label: hazLabel(130),
          weekDay: 'TUESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 123,
          label: hazLabel(123),
          weekDay: 'TUESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 124,
          label: hazLabel(124),
          weekDay: 'TUESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 125,
          label: hazLabel(125),
          weekDay: 'TUESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 126,
          label: hazLabel(126),
          weekDay: 'TUESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un miercoles
        {
          idTeacherAssignment: 128,
          label: hazLabel(128),
          weekDay: 'WEDNESDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 127,
          label: hazLabel(127),
          weekDay: 'WEDNESDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 129,
          label: hazLabel(129),
          weekDay: 'WEDNESDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 130,
          label: hazLabel(130),
          weekDay: 'WEDNESDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 123,
          label: hazLabel(123),
          weekDay: 'WEDNESDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 124,
          label: hazLabel(124),
          weekDay: 'WEDNESDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un jueves
        {
          idTeacherAssignment: 125,
          label: hazLabel(125),
          weekDay: 'THURSDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 126,
          label: hazLabel(126),
          weekDay: 'THURSDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 128,
          label: hazLabel(128),
          weekDay: 'THURSDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 127,
          label: hazLabel(127),
          weekDay: 'THURSDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 123,
          label: hazLabel(123),
          weekDay: 'THURSDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 124,
          label: hazLabel(124),
          weekDay: 'THURSDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

          //un viernes
        {
          idTeacherAssignment: 125,
          label: hazLabel(125),
          weekDay: 'FRIDAY',
          startTime: '08:15',
          finishTime: '09:15',
        },
        {
          idTeacherAssignment: 126,
          label: hazLabel(126),
          weekDay: 'FRIDAY',
          startTime: '09:15',
          finishTime: '10:15',
        },
        {
          idTeacherAssignment: 123,
          label: hazLabel(123),
          weekDay: 'FRIDAY',
          startTime: '10:15',
          finishTime: '11:15',
        },
        {
          idTeacherAssignment: 124,
          label: hazLabel(124),
          weekDay: 'FRIDAY',
          startTime: '11:45',
          finishTime: '12:45',
        },
        {
          idTeacherAssignment: 124,
          label: hazLabel(124),
          weekDay: 'FRIDAY',
          startTime: '12:45',
          finishTime: '13:45',
        },
        {
          idTeacherAssignment: 124,
          label: hazLabel(124),
          weekDay: 'FRIDAY',
          startTime: '13:45',
          finishTime: '14:45',
        },

      ]
    });


    //CLASS SESSIONS
    console.log('Creando Class Sessions...');

    const weekSchedulesForSessions = await prisma.weekSchedule.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, weekDay: true },
    });

    const CLASS_SESSION_WEEKS = 4;
    const WEEK1_MONDAY = new Date('2025-09-15T00:00:00.000Z');
    const DAY_OFFSET: Record<string, number> = {
      MONDAY: 0,
      TUESDAY: 1,
      WEDNESDAY: 2,
      THURSDAY: 3,
      FRIDAY: 4,
    };

    function classSessionDate(weekIndex: number, weekDay: string): Date {
      const d = new Date(WEEK1_MONDAY);
      d.setUTCDate(d.getUTCDate() + weekIndex * 7 + DAY_OFFSET[weekDay]);
      return d;
    }

    /** 16 bloques × 30 franjas = 480 weekSchedule (1º y 2º, mañana/tarde). */
    const SLOTS_PER_CLASS_BLOCK = 30;
    const CLASS_BLOCK_LABELS = [
      '1º DAM mañana',
      '1º DAM tarde',
      '1º DAW mañana',
      '1º ASIR mañana',
      '1º SMR mañana',
      '1º DAW tarde',
      '1º IT mañana',
      '1º ME mañana',
      '2º DAM mañana',
      '2º DAM tarde',
      '2º DAW mañana',
      '2º DAW tarde',
      '2º ASIR mañana',
      '2º SMR mañana',
      '2º IT mañana',
      '2º ME mañana',
    ] as const;

    const classBlockCount = Math.floor(
      weekSchedulesForSessions.length / SLOTS_PER_CLASS_BLOCK,
    );
    if (classBlockCount !== CLASS_BLOCK_LABELS.length) {
      throw new Error(
        'weekSchedule: se esperaban ' +
          CLASS_BLOCK_LABELS.length +
          ' bloques de ' +
          SLOTS_PER_CLASS_BLOCK +
          ' franjas, hay ' +
          classBlockCount,
      );
    }

    const classSessionData: {
      date: Date;
      status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
      apointments: string;
      idSchedule: number;
    }[] = [];

    /** Sesiones pasadas mayormente COMPLETED; algunas CANCELLED/SCHEDULED para el informe. */
    function rollSessionStatus(weekIndex: number): 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' {
      if (weekIndex >= 3) return 'SCHEDULED';
      const roll = Math.random();
      if (roll < 0.1) return 'CANCELLED';
      return 'COMPLETED';
    }

    for (let blockIndex = 0; blockIndex < classBlockCount; blockIndex++) {
      const blockSlots = weekSchedulesForSessions.slice(
        blockIndex * SLOTS_PER_CLASS_BLOCK,
        blockIndex * SLOTS_PER_CLASS_BLOCK + SLOTS_PER_CLASS_BLOCK,
      );
      if (blockSlots.length !== SLOTS_PER_CLASS_BLOCK) {
        throw new Error(
          'Bloque ' +
            CLASS_BLOCK_LABELS[blockIndex] +
            ': se esperaban ' +
            SLOTS_PER_CLASS_BLOCK +
            ' franjas, hay ' +
            blockSlots.length,
        );
      }
      for (let weekIndex = 0; weekIndex < CLASS_SESSION_WEEKS; weekIndex++) {
        for (const slot of blockSlots) {
          classSessionData.push({
            date: classSessionDate(weekIndex, slot.weekDay),
            status: rollSessionStatus(weekIndex),
            apointments: '',
            idSchedule: slot.id,
          });
        }
      }
    }

    const classSession = await prisma.sessionClass.createMany({
      data: classSessionData,
    });


// ASISTENCIAS — una fila por alumno matriculado en cada sesión
    console.log('Creando Asistencias...');

    const enrollmentsForAssistance =
      await prisma.studentOnSubjectOnGroup.findMany({
        select: { id: true, idGroup: true, idSubject: true },
      });

    const enrollmentByGroupSubject = new Map<string, number[]>();
    for (const e of enrollmentsForAssistance) {
      const key = e.idGroup + ':' + e.idSubject;
      const list = enrollmentByGroupSubject.get(key) ?? [];
      list.push(e.id);
      enrollmentByGroupSubject.set(key, list);
    }

    const sessionsForAssistance = await prisma.sessionClass.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        schedule: {
          select: {
            teacherAssignment: { select: { idGroup: true, idSubject: true } },
          },
        },
      },
    });

    type AssistanceSeedRow = {
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      idSession: number;
      idStudentEnrollment: number;
      justificationUri?: string;
      justificationStatus?: 'PENDING' | 'VIEWED' | 'REJECTED';
    };

    /** Presente, ausente, retraso, excusado y justificantes para el informe Excel. */
    function rollAssistanceStatus(): AssistanceSeedRow {
      const roll = Math.floor(Math.random() * 100) + 1;
      if (roll <= 5) {
        return {
          status: 'EXCUSED',
          idSession: 0,
          idStudentEnrollment: 0,
          justificationUri: 'seed/justificantes/excusado.pdf',
          justificationStatus: 'VIEWED',
        };
      }
      if (roll <= 10) {
        return {
          status: 'ABSENT',
          idSession: 0,
          idStudentEnrollment: 0,
          justificationUri: 'seed/justificantes/pendiente.pdf',
          justificationStatus: 'PENDING',
        };
      }
      if (roll <= 13) {
        return {
          status: 'ABSENT',
          idSession: 0,
          idStudentEnrollment: 0,
          justificationUri: 'seed/justificantes/rechazado.pdf',
          justificationStatus: 'REJECTED',
        };
      }
      if (roll <= 16) {
        return {
          status: 'ABSENT',
          idSession: 0,
          idStudentEnrollment: 0,
          justificationUri: 'seed/justificantes/visto.pdf',
          justificationStatus: 'VIEWED',
        };
      }
      if (roll <= 22) return { status: 'ABSENT', idSession: 0, idStudentEnrollment: 0 };
      if (roll <= 28) return { status: 'LATE', idSession: 0, idStudentEnrollment: 0 };
      return { status: 'PRESENT', idSession: 0, idStudentEnrollment: 0 };
    }

    const assistanceData: AssistanceSeedRow[] = [];

    for (const session of sessionsForAssistance) {
      const assignment = session.schedule.teacherAssignment;
      if (!assignment) continue;
      const enrollments =
        enrollmentByGroupSubject.get(
          assignment.idGroup + ':' + assignment.idSubject,
        ) ?? [];
      for (const idStudentEnrollment of enrollments) {
        const rolled = rollAssistanceStatus();
        assistanceData.push({
          status: rolled.status,
          idSession: session.id,
          idStudentEnrollment,
          ...(rolled.justificationUri
            ? {
                justificationUri: rolled.justificationUri,
                justificationStatus: rolled.justificationStatus,
              }
            : {}),
        });
      }
    }

    const ASSISTANCE_CHUNK = 2000;
    let assistance = { count: 0 };
    for (let i = 0; i < assistanceData.length; i += ASSISTANCE_CHUNK) {
      const chunk = await prisma.assistance.createMany({
        data: assistanceData.slice(i, i + ASSISTANCE_CHUNK),
      });
      assistance.count += chunk.count;
    }


  console.log('Creando Tasks (THEORY + PRACTICE)...');

  const now = new Date();
  const courseYearEnd = new Date("2026-06-30T23:59:59.000Z");
  const practiceDue = new Date(now);
  practiceDue.setDate(practiceDue.getDate() + 21);

  const twoWeeksFromNow = new Date(now);
  twoWeeksFromNow.setDate(now.getDate() + 14);
  const examDue = new Date(twoWeeksFromNow.getTime() + 2 * 60 * 60 * 1000);

  const assignmentsForTasks = await prisma.teacherOnSubjectOnGroup.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      schoolYear: true,
      subject: { select: { name: true } },
    },
  });

  const taskSeedData: {
    idTeacherAssignment: number;
    title: string;
    description: string;
    type: "THEORY" | "PRACTICE";
    startDate: Date;
    dueDate: Date;
    schoolYear: string;
    isPublished: boolean;
  }[] = [];

  for (const assignment of assignmentsForTasks) {
    const copy = subjectTaskCopy(assignment.subject.name);
    taskSeedData.push(
      {
        idTeacherAssignment: assignment.id,
        title: copy.theoryTitle,
        description: copy.theoryDescription,
        type: "THEORY",
        startDate: now,
        dueDate: courseYearEnd,
        schoolYear: assignment.schoolYear,
        isPublished: true,
      },
      {
        idTeacherAssignment: assignment.id,
        title: copy.practiceTitle,
        description: copy.practiceDescription,
        type: "PRACTICE",
        startDate: now,
        dueDate: practiceDue,
        schoolYear: assignment.schoolYear,
        isPublished: true,
      },
    );
  }

  const TASK_CHUNK = 2000;
  let theoryTasks = { count: 0 };
  let practiceTasks = { count: 0 };
  for (let i = 0; i < taskSeedData.length; i += TASK_CHUNK) {
    const chunk = taskSeedData.slice(i, i + TASK_CHUNK);
    const result = await prisma.task.createMany({ data: chunk });
    theoryTasks.count += chunk.filter((t) => t.type === "THEORY").length;
    practiceTasks.count += chunk.filter((t) => t.type === "PRACTICE").length;
    if (result.count !== chunk.length) {
      throw new Error(
        "task.createMany: se esperaban " +
          chunk.length +
          " filas, insertadas " +
          result.count,
      );
    }
  }

  // ===========================
  // 2. CREAR TAREAS DE EXAMEN (EXAM)
  // ===========================

  console.log('Creando Tasks(EXAM)...');

  const examTaskData: {
    idTeacherAssignment: number;
    title: string;
    description: string;
    type: "EXAM";
    startDate: Date;
    dueDate: Date;
    schoolYear: string;
    isPublished: boolean;
  }[] = [];

  for (const assignment of assignmentsForTasks) {
    const exam = examTaskCopy(assignment.subject.name);
    examTaskData.push({
      idTeacherAssignment: assignment.id,
      title: exam.title,
      description: exam.description,
      type: "EXAM",
      startDate: twoWeeksFromNow,
      dueDate: examDue,
      schoolYear: assignment.schoolYear,
      isPublished: true,
    });
  }

  let examTasks = { count: 0 };
  for (let i = 0; i < examTaskData.length; i += TASK_CHUNK) {
    const chunk = examTaskData.slice(i, i + TASK_CHUNK);
    const result = await prisma.task.createMany({ data: chunk });
    examTasks.count += result.count;
  }

  // Tarea vencida sin entregas (hoja Anomalias del informe de uso)
  if (assignmentsForTasks.length > 0) {
    await prisma.task.create({
      data: {
        idTeacherAssignment: assignmentsForTasks[0].id,
        title: '[SEED] Tarea vencida sin entregas',
        description: 'Anomalía de prueba para el informe de uso.',
        type: 'HOMEWORK',
        startDate: new Date('2024-09-01T08:00:00.000Z'),
        dueDate: new Date('2024-10-15T23:59:59.000Z'),
        schoolYear: acaYear,
        isPublished: true,
      },
    });
  }

  // ===========================
  // 3. CREAR STUDENT TASKS (entregas variadas)
  // ===========================

  console.log('Creando studentTasks...');

  const enrollmentsForStudentTasks =
    await prisma.studentOnSubjectOnGroup.findMany({
      select: { id: true, idGroup: true, idSubject: true },
    });

  const enrollmentByGroupSubjectForTasks = new Map<string, number[]>();
  for (const e of enrollmentsForStudentTasks) {
    const key = e.idGroup + ':' + e.idSubject;
    const list = enrollmentByGroupSubjectForTasks.get(key) ?? [];
    list.push(e.id);
    enrollmentByGroupSubjectForTasks.set(key, list);
  }

  const tasksForStudentTasks = await prisma.task.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      dueDate: true,
      teacherAssignment: { select: { idGroup: true, idSubject: true } },
    },
  });

  type StudentTaskSeedRow = {
    idTask: number;
    idStudentEnrollment: number;
    status: 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED';
    submissionDate?: Date;
    score?: number;
  };

  /** Entregas variadas para poblar hojas Tareas y Adopcion del informe. */
  function rollStudentTaskRow(
    taskId: number,
    enrollmentId: number,
    dueDate: Date,
  ): Omit<StudentTaskSeedRow, 'idTask' | 'idStudentEnrollment'> {
    const hash = (taskId * 31 + enrollmentId) % 100;
    const submission = new Date(dueDate);
    submission.setUTCDate(submission.getUTCDate() - (hash % 14) - 1);

    if (hash < 28) {
      return { status: 'GRADED', submissionDate: submission, score: 5 + (hash % 5) };
    }
    if (hash < 52) {
      return { status: 'SUBMITTED', submissionDate: submission };
    }
    if (hash < 62) {
      const late = new Date(dueDate);
      late.setUTCDate(late.getUTCDate() + 1);
      return { status: 'LATE', submissionDate: late };
    }
    return { status: 'PENDING' };
  }

  const studentTaskData: StudentTaskSeedRow[] = [];

  for (const task of tasksForStudentTasks) {
    const assignment = task.teacherAssignment;
    const enrollments =
      enrollmentByGroupSubjectForTasks.get(
        assignment.idGroup + ':' + assignment.idSubject,
      ) ?? [];
    for (const idStudentEnrollment of enrollments) {
      const rolled = rollStudentTaskRow(task.id, idStudentEnrollment, task.dueDate);
      // La tarea vencida sin entregas debe quedar toda PENDING (anomalía informe).
      const isExpiredAnomaly = task.dueDate < new Date('2025-01-01T00:00:00.000Z');
      studentTaskData.push({
        idTask: task.id,
        idStudentEnrollment,
        status: isExpiredAnomaly ? 'PENDING' : rolled.status,
        ...(isExpiredAnomaly
          ? {}
          : {
              ...(rolled.submissionDate ? { submissionDate: rolled.submissionDate } : {}),
              ...(rolled.score !== undefined ? { score: rolled.score } : {}),
            }),
      });
    }
  }

  const STUDENT_TASK_CHUNK = 2000;
  let studentTasks = { count: 0 };
  for (let i = 0; i < studentTaskData.length; i += STUDENT_TASK_CHUNK) {
    const chunk = await prisma.studentTask.createMany({
      data: studentTaskData.slice(i, i + STUDENT_TASK_CHUNK),
    });
    studentTasks.count += chunk.count;
  }

  // ===========================
  // CALIFICACIONES (hoja Calificaciones del informe)
  // ===========================

  console.log('Creando calificaciones...');

  const enrollmentsForGrades = await prisma.studentOnSubjectOnGroup.findMany({
    where: { schoolYear: acaYear, status: 'ENROLLED' },
    select: { id: true, idGroup: true, idSubject: true },
  });

  const assignmentsForGrades = await prisma.teacherOnSubjectOnGroup.findMany({
    where: { schoolYear: acaYear, status: 'ACTIVE' },
    select: { idTeacher: true, idGroup: true, idSubject: true },
  });

  const teacherByGroupSubject = new Map<string, number | null>();
  for (const a of assignmentsForGrades) {
    teacherByGroupSubject.set(`${a.idGroup}:${a.idSubject}`, a.idTeacher);
  }

  const gradePeriods = [
    'INITIAL',
    'FIRST_TRIMESTER',
    'SECOND_TRIMESTER',
    'THIRD_TRIMESTER',
    'FINAL',
  ] as const;

  const gradeData: {
    idStudentEnrollment: number;
    period: (typeof gradePeriods)[number];
    value: number;
  }[] = [];

  for (const e of enrollmentsForGrades) {
    const teacherId = teacherByGroupSubject.get(`${e.idGroup}:${e.idSubject}`);
    if (!teacherId) continue;
    for (const period of gradePeriods) {
      gradeData.push({
        idStudentEnrollment: e.id,
        period,
        value: 5 + (e.id % 5),
      });
    }
  }

  const GRADE_CHUNK = 2000;
  let subjectEvaluations = { count: 0 };
  for (let i = 0; i < gradeData.length; i += GRADE_CHUNK) {
    const chunk = await prisma.subjectEvaluation.createMany({
      data: gradeData.slice(i, i + GRADE_CHUNK),
    });
    subjectEvaluations.count += chunk.count;
  }

  // ===========================
  // NOTIFICACIONES Y ANUNCIOS (hoja Comunicacion del informe)
  // ===========================

  console.log('Creando notificaciones y anuncios...');

  const studentsForNotifications = await prisma.student.findMany({
    select: { firebaseUID: true },
    take: 24,
  });

  const notificationTypes = ['INFO', 'TASK', 'GRADE', 'ATTENDANCE', 'ANNOUNCEMENT'] as const;
  const notificationData: {
    recipientFirebaseUID: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < studentsForNotifications.length; i++) {
    const uid = studentsForNotifications[i].firebaseUID;
    for (const type of notificationTypes) {
      const createdAt = new Date('2025-10-01T09:00:00.000Z');
      createdAt.setUTCDate(createdAt.getUTCDate() + i);
      const isRead = i % 4 !== 0;
      notificationData.push({
        recipientFirebaseUID: uid,
        title: `[SEED] ${type}`,
        message: 'Notificación de prueba para el informe de uso.',
        type,
        isRead,
        readAt: isRead
          ? new Date(createdAt.getTime() + 3600000 * (2 + (i % 6)))
          : null,
        createdAt,
      });
    }
  }

  const notifications = await prisma.notification.createMany({ data: notificationData });


  console.log('Creando anuncios del tablón (issues)...');
  const issues = await prisma.issue.createMany({
    data: [
      {
        idAdmin: 1,
        audience: 'CENTER',
        title: '[SEED] Bienvenida al centro',
        body: 'Anuncio de prueba para toda la comunidad educativa (CENTER).',
        isPublished: true,
      },
      {
        idAdmin: 1,
        audience: 'ALL_TEACHERS',
        title: '[SEED] Reunión de profesorado',
        body: 'Comunicado de prueba dirigido a todos los profesores.',
        isPublished: true,
      },
      {
        idAdmin: 1,
        audience: 'ALL_STUDENTS',
        title: '[SEED] Aviso general alumnado',
        body: 'Anuncio de prueba para todos los alumnos.',
        isPublished: true,
      },
      {
        idAdmin: 1,
        audience: 'GROUP',
        idGroup: 1,
        title: '[SEED] Aviso grupo Mañana (admin)',
        body: 'Comunicado de prueba para el grupo Mañana emitido por administración.',
        isPublished: true,
      },
      {
        idAdmin: 1,
        audience: 'TEACHER',
        idTargetTeacher: 2,
        title: '[SEED] Aviso a un profesor concreto',
        body: 'Solo lo ve el profesor con idTargetTeacher=2.',
        isPublished: true,
      },
      {
        idAdmin: 1,
        audience: 'COURSE',
        idCourse: 1,
        title: '[SEED] Información curso DAM',
        body: 'Comunicado de prueba para todo el ciclo DAM.',
        isPublished: true,
      },
      {
        idAdmin: 1,
        audience: 'COURSE',
        idCourse: 1,
        grade: '1',
        title: '[SEED] Información 1º DAM',
        body: 'Comunicado de prueba solo para matrículas de 1º en DAM.',
        isPublished: true,
      },
      {
        idAdmin: 1,
        audience: 'SUBJECT_GROUP',
        idGroup: 1,
        idSubject: 1,
        title: '[SEED] Programación — grupo Mañana',
        body: 'Anuncio de prueba para la asignatura Programación en el grupo Mañana.',
        isPublished: true,
      },
      {
        idAdmin: 1,
        audience: 'STUDENT',
        idTargetStudent: 1,
        title: '[SEED] Aviso a un alumno concreto',
        body: 'Solo lo ve el alumno con idTargetStudent=1.',
        isPublished: true,
      },
      {
        idAdmin: 1,
        audience: 'ALL_STUDENTS',
        title: '[SEED] Borrador sin publicar',
        body: 'Borrador de prueba (no debe aparecer en listados activos).',
        isPublished: false,
      },
      {
        idAdmin: 1,
        audience: 'CENTER',
        title: '[SEED] Anuncio caducado',
        body: 'Anuncio de prueba con fecha de expiración pasada.',
        isPublished: true,
        expiresAt: new Date('2024-06-01'),
      },
    ],
  });

  console.log('✅ Seed completado exitosamente!');
  console.log(`📚 ${students.count} estudiantes creados`);
  console.log(`👨‍🏫 ${teachers.count} profesores creados`);
  console.log(`🎓 ${courses.count} cursos creados`);
  console.log(`📖 ${subjects.count} asignaturas creadas`);
  console.log(`👥 ${groups.count} grupos creados`);
  console.log(`👥 ${enrollments.count} enrollments creados`);
  console.log(`👥 ${assignments.count} assignments creados`);
  console.log(`👥 ${weekSchedule.count} weekSchedules creados`);
  console.log(`👥 ${classSession.count} classSessions creados`);
  console.log(`👥 ${assistance.count} assistances creados`);


  console.log(`✅ ${theoryTasks.count} tareas THEORY creadas`);
  console.log(`✅ ${practiceTasks.count} tareas PRACTICE creadas`);
  console.log(`✅ ${examTasks.count} tareas de examen creadas`);
  console.log(`✅ ${studentTasks.count} StudentTasks creadas`);
  console.log(`✅ ${subjectEvaluations.count} calificaciones creadas`);
  console.log(`✅ ${notifications.count} notificaciones creadas`);
  console.log(`📢 ${issues.count} anuncios (issues) creados`);
  console.log(`${studentPasswords.count} contrasenas de alumnos creadas`);

}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });