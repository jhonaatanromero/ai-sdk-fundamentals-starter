import { z } from 'zod';

export const appointmentSchema = z.object({
  title: z
    .string()
    .describe('A short name for the appointment'),
  date: z
    .string()
    .nullable()
    .describe(
      'The date of the appointment in YYYY-MM-DD format. Today is Tuesday, 2026-09-22. Return null if the text does not state or imply a date.'
    ),
  startTime: z
    .string()
    .nullable()
    .describe('The start time in 24-hour HH:mm format. Null if not stated.'),
  endTime: z
    .string()
    .nullable()
    .describe('The end time in 24-hour HH:mm format. Null if not stated.'),
  location: z
    .string()
    .nullable()
    .describe('Where the appointment takes place. Null if not stated.'),
  attendees: z
    .array(z.string())
    .nullable()
    .describe(
      'The names of individual people attending. Only include actual personal names, never group references like "the team". Null if no individuals are named.'
    ),
});
