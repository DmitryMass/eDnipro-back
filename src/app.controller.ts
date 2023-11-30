import { Controller, UseFilters } from '@nestjs/common';
import { ErrorFilter } from './middleware/error.middleware';

@Controller()
export class AppController {}
