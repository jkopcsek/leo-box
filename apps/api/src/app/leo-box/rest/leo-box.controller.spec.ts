import { Test, TestingModule } from '@nestjs/testing';

import { LeoBoxController } from './leo-box.controller';

describe('LeoBoxController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [LeoBoxController],
    }).compile();
  });

});
