import {
  convertActivationsToApiFormat,
  getMainskill,
  getMainskillNames
} from '@src/utils/mainskill-utils/mainskill-utils.js';
import tsoa from '@tsoa/runtime';
const { Controller, Path, Get, Route, Tags } = tsoa;

@Route('api/mainskill')
@Tags('mainskill')
export default class MainskillController extends Controller {
  @Get('/{name}')
  public async getMainskill(@Path() name: string) {
    const mainskill = getMainskill(name);
    const activations = convertActivationsToApiFormat(mainskill.activations, mainskill.maxLevel);

    return {
      ...mainskill,
      activations,
      description: mainskill.description({ skillLevel: 1 }),
      units: mainskill.getUnits(),
      maxLevel: mainskill.maxLevel,
      isModified: mainskill.isModified,
      activationNames: mainskill.getActivationNames()
    };
  }

  @Get('/')
  public async getMainskills(): Promise<string[]> {
    return getMainskillNames();
  }
}
