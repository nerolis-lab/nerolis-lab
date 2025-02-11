import type { Request, Response } from 'express';
import express from 'express';

export type RequestBody<T> = Request<object, object, T, object>;
export type ResponseBody<T> = Response<T>;

class BaseRouterImpl {
  public router = express.Router();
}

export const BaseRouter = new BaseRouterImpl();
