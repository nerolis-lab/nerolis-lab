/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import workerpool from 'workerpool';
import ProductionController from '../../controllers/calculator/production.controller.js';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service.js';

async function calculateProduction(name: string, body: any, includeAnalysis: boolean, pretty: boolean) {
  const controller = new ProductionController();
  const data = await controller.calculatePokemonProduction(name, body, includeAnalysis);
  return pretty ? WebsiteConverterService.toProductionCalculator(data) : data;
}

async function calculateTeam(body: any, maybeUser?: DBUser) {
  const controller = new ProductionController();
  return await controller.calculateTeam(body, maybeUser);
}

async function calculateIv(body: any) {
  const controller = new ProductionController();
  return await controller.calculateIv(body);
}

// TODO: might not be necessary at all, perhaps we can just use calculateIv directly
async function quickCalculate(body: any, maybeUser?: DBUser) {
  const controller = new ProductionController();
  return await controller.quickCalculate(body, maybeUser);
}

workerpool.worker({
  calculateProduction,
  calculateTeam,
  calculateIv,
  quickCalculate
});
