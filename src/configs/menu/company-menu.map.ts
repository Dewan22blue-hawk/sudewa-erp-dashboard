import { getGeneralMenus } from './general.menu';
import { getTransindoMenus } from './transindo.menu';
import { getYanotamaMenus } from './yanotama.menu';
import { MenuItem } from '@/types/menu.types';

export const companyMenuMap: Record<string, (slug: string) => MenuItem[]> = {
    transindo: getTransindoMenus,
    yanotama: getYanotamaMenus,
    default: getGeneralMenus,
};
