import { hash } from 'bcryptjs';
import { inspect } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/prisma/generated/client.js';
import * as dotenv from 'dotenv';

dotenv.config();

const DEFAULTS = {
  identityDocumentAbbreviation: 'DNI',
  identityDocumentDescription: 'Documento Nacional de Identidad',
  personDocumentNumber: '00000000',
  personGivenNames: 'Admin',
  personPaternalSurname: 'Parroquial',
  personMaternalSurname: 'Inicial',
  userUsername: 'admin',
  auditUser: 'seed',
} as const;

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`La variable ${name} es requerida para ejecutar el seed.`);
  }

  return value;
};

const buildDatabaseUrl = (): string => {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = process.env.DATABASE_PORT || '5432';
  const databaseName = getRequiredEnv('DATABASE_NAME');
  const user = getRequiredEnv('DATABASE_USER');
  const password = getRequiredEnv('DATABASE_PASSWORD');

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${databaseName}`;
};

const getSeedPassword = (): string => {
  const password = process.env.SEED_USER_PASSWORD;

  if (!password) {
    throw new Error(
      'SEED_USER_PASSWORD es obligatoria para ejecutar el seed inicial.',
    );
  }

  if (password.length < 6) {
    throw new Error('SEED_USER_PASSWORD debe tener al menos 6 caracteres.');
  }

  return password;
};

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: buildDatabaseUrl(),
  }),
});

const seedInitialAccess = async (): Promise<void> => {
  const identityDocumentAbbreviation =
    process.env.SEED_IDENTITY_DOCUMENT_ABBREVIATION ||
    DEFAULTS.identityDocumentAbbreviation;
  const identityDocumentDescription =
    process.env.SEED_IDENTITY_DOCUMENT_DESCRIPTION ||
    DEFAULTS.identityDocumentDescription;
  const personDocumentNumber =
    process.env.SEED_PERSON_DOCUMENT_NUMBER || DEFAULTS.personDocumentNumber;
  const personGivenNames =
    process.env.SEED_PERSON_GIVEN_NAMES || DEFAULTS.personGivenNames;
  const personPaternalSurname =
    process.env.SEED_PERSON_PATERNAL_SURNAME || DEFAULTS.personPaternalSurname;
  const personMaternalSurname =
    process.env.SEED_PERSON_MATERNAL_SURNAME || DEFAULTS.personMaternalSurname;
  const userUsername = process.env.SEED_USER_USERNAME || DEFAULTS.userUsername;
  const userPassword = getSeedPassword();
  const auditUser = process.env.SEED_AUDIT_USER || DEFAULTS.auditUser;

  const passwordHash = await hash(userPassword, 10);

  const identityDocumentType = await prisma.identityDocumentType.upsert({
    where: { abbreviation: identityDocumentAbbreviation },
    update: {
      description: identityDocumentDescription,
      active: true,
      updatedBy: auditUser,
    },
    create: {
      abbreviation: identityDocumentAbbreviation,
      description: identityDocumentDescription,
      active: true,
      createdBy: auditUser,
      updatedBy: auditUser,
    },
  });

  const existingPerson = await prisma.person.findUnique({
    where: {
      identityDocumentTypeId_identityDocumentNumber: {
        identityDocumentTypeId: identityDocumentType.id,
        identityDocumentNumber: personDocumentNumber,
      },
    },
  });

  const person = existingPerson
    ? await prisma.person.update({
        where: { id: existingPerson.id },
        data: {
          givenNames: personGivenNames,
          paternalSurname: personPaternalSurname,
          maternalSurname: personMaternalSurname,
          active: true,
          updatedBy: auditUser,
        },
      })
    : await prisma.person.create({
        data: {
          identityDocumentNumber: personDocumentNumber,
          givenNames: personGivenNames,
          paternalSurname: personPaternalSurname,
          maternalSurname: personMaternalSurname,
          active: true,
          createdBy: auditUser,
          updatedBy: auditUser,
          identityDocumentType: {
            connect: { id: identityDocumentType.id },
          },
        },
      });

  const userByUsername = await prisma.user.findUnique({
    where: { username: userUsername },
  });

  if (userByUsername && userByUsername.personId !== person.id) {
    throw new Error(
      `El username ${userUsername} ya existe y pertenece a otra persona. Configura SEED_USER_USERNAME con otro valor.`,
    );
  }

  const userByPerson = await prisma.user.findUnique({
    where: { personId: person.id },
  });

  const user = userByPerson
    ? await prisma.user.update({
        where: { id: userByPerson.id },
        data: {
          username: userUsername,
          password: passwordHash,
          active: true,
          updatedBy: auditUser,
        },
      })
    : await prisma.user.create({
        data: {
          username: userUsername,
          password: passwordHash,
          active: true,
          createdBy: auditUser,
          updatedBy: auditUser,
          person: {
            connect: { id: person.id },
          },
        },
      });

  console.log('Seed completado.');
  console.log(`Tipo de documento: ${identityDocumentType.abbreviation}`);
  console.log(
    `Persona: ${person.givenNames} ${person.paternalSurname} ${person.maternalSurname}`,
  );
  console.log(`Usuario: ${user.username}`);
};

const main = async (): Promise<void> => {
  await prisma.$connect();
  await seedInitialAccess();
};

void main()
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(inspect(error, { depth: null }));
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
