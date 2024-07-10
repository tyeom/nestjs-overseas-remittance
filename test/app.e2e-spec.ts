import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API endpoints testing (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/signup', () => {
    it('if username is existed', async () => {
      const res = await request(app.getHttpServer())
      .post('/user/signup')
      .send({
        userId : "test@test.com",
        password :"123",
        name : "테스트 유저",
        idType : "REG_NO",
        idValue : "001123-3111111"
      });
      expect(res.status).toBe(400);
    });

    it('if idType validation falil', async () => {
      const res = await request(app.getHttpServer())
      .post('/user/signup')
      .send({
        userId : "test@test.com",
        password :"123",
        name : "테스트 유저",
        idType : "REG_NO1",
        idValue : "001123-3111111"
      });
      expect(res.status).toBe(400);
    });

    // BeforeRemove 등으로 "test3@test.com" 유저 데이터 삭제 후 테스트 되도록 처리
    // it('successed', async () => {
    //   const res = await request(app.getHttpServer())
    //   .post('/user/signup')
    //   .send({
    //     userId : "test3@test.com",
    //     password :"123",
    //     name : "테스트 유저",
    //     idType : "REG_NO",
    //     idValue : "001123-3111111"
    //   });
    //   expect(res.status).toBe(200);
    // });
  });

  describe('transfer (USER)', () => {
    let jwttoken: any;
    let quoteId: number;
    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/user/login')
        .send({
          "userId" : "test3@test.com", // 아이디
          "password" : "123" // 비밀번호
        });

      expect(res.status).toBe(200);
      jwttoken = res.body.token;
    });

    it('/transfer/quote (POST) successed', async () => {
      const res = await request(app.getHttpServer())
        .post('/transfer/quote')
        .set('Authorization', 'Bearer ' + jwttoken)
        .send({
          "amount" : 1000000,
          "targetCurrency" : "USD"
        });
      console.log(res.status);
      expect(res.status).toBe(200);
      quoteId = res.body.quote.quoteId;
    });

    it('/transfer/request (POST) successed', async () => {
      const res = await request(app.getHttpServer())
        .post('/transfer/request')
        .set('Authorization', 'Bearer ' + jwttoken)
        .send({
          "quoteId" : quoteId // 채번한 quote의 id
        });
      console.log(res.status);
      expect(res.status).toBe(200);
    });

    it('/transfer/list (GET) successed', async () => {
      const res = await request(app.getHttpServer())
        .get('/transfer/list')
        .set('Authorization', 'Bearer ' + jwttoken)
        .send();
      console.log(res.status);
      expect(res.status).toBe(200);
      expect(res.body.history.length).toBeGreaterThanOrEqual(1);
    });
  });
});