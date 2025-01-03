import _ from 'lodash';
import { Op } from 'sequelize';
import models, { sequelize, QueryTypes } from '@models';
import * as common from '@controllers/admin/common';
import serialize from '@core/util/serialize';
import unserialize from '@core/util/unserialize';
import useLog from '@core/logger';
import { whereWrap } from '@core/util/obj';
import { reloadConfig } from '@core/config';
import { Perm } from '@server/decorators';
import { {{ModuleName}}Dto, {{ModuleName}}ListDTO } from './dto/{{ModuleName}}Dto'; // Import DTO
import { Res, Req, Controller, Post, Validate } from '@server/decorators';

const log = useLog('{{moduleName}}');

@Controller('/conf')
export class {{ModuleName}}Controller {
  @Perm('{{moduleName}}:view')
  @Validate({
    type: {{ModuleName}}ListDTO
  })
  @Post('/load')
  public async postList(@Req() req: any, @Res() res: any, next: any) {
    let { page, pageSize,  scope, label, varname } = req.body;

    try {
      const { count, rows } = await models.{{moduleName}}.findAndCountAll({
        attributes: [
          'id',
          'varname',
          'value',
          'label',
          'placeholder',
          'ctip',
          'type',
          'options',
          'scope',
          'sort',
        ],
        where: whereWrap({ scope, label, varname }),
        offset: (page - 1) * pageSize,
        limit: pageSize,
        order: [
          ['sort', 'DESC'],
          ['created_at', 'ASC'],
        ],
      });

      const data = rows.map((item: any) => {
        item.value = unserialize(item.value);
        item.options = item.options ? unserialize(item.options) : '';
        if (item.varname === 'upload_dir') {
          item.ctip = item.ctip.replace('{pwd}', process.env.PWD);
        }
        return item;
      });

      res.success({ data, total: count, filtered: count });
    } catch (error) {
      log.error('Error loading configuration:', error);
      res.fail({ msg: 'System busy, please try again later' });
    }
  }

  @Perm('{{moduleName}}:edit', '{{moduleName}}:add')
  @Validate({ type: {{ModuleName}}Dto }) // Validate with DTO
  @Post('/save')
  public async postSave(@Req() req: any, @Res() res: any, next: any) {
    const result = { msg: '' };
    const {
      id: hasId,
      varname,
      description,
      label,
      placeholder,
      ctip,
      type,
      options,
      scope,
      value,
      sort,
    } = req.body;

    try {
      if (hasId) {
        await models.{{moduleName}}.update(
          {
            varname,
            value: serialize(value || ''),
            label,
            placeholder,
            ctip,
            type,
            options: serialize(options || ''),
            scope,
            description,
            sort,
          },
          { where: { id: hasId } }
        );

        await common.saveOperateLog(req, `Update configuration: ${varname}; ID: ${hasId}`);
        return res.success({ msg: 'Update successful' });
      } else {
        const existing = await models.{{moduleName}}.findAll({ where: { varname } });

        if (existing.length > 0) {
          result.msg = 'Variable name already exists';
          return res.fail(result);
        }

        await models.{{moduleName}}.create({
          varname,
          value: serialize(value),
          label,
          placeholder,
          ctip,
          type,
          options: serialize(options || ''),
          scope,
          description,
          sort,
        });

        await common.saveOperateLog(req, `Add variable: ${varname}`);
        return res.success({ msg: 'Create successful' });
      }
    } catch (error) {
      log.error('Error saving configuration:', error);
      result.msg = 'Save failed';
      res.fail(result);
    }
  }

  @Perm('{{moduleName}}:edit')
  @Post('/formsave')
  public async postFormSave(@Req() req: any, @Res() res: any, next: any) {
    const result = { msg: '' };
    const saveSet = Object.entries(req.body).map(([key, val]) => ({ varname: key, value: val }));

    const updateRow = async (varname: string, value: any) =>
      models.{{moduleName}}.update({ value: serialize(value) }, { where: { varname } });

    const buildRowPromises = async (requestObject: any) =>
      Promise.all(
        _.map(requestObject, (value: any) => Promise.resolve().then(() => updateRow(value.varname, value.value)))
      );

    try {
      await buildRowPromises(saveSet);
      res.success(result);
      reloadConfig();
    } catch (error) {
      log.error('Error saving form configuration:', error);
      result.msg = 'Save failed';
      res.fail(result);
    }
  }

  @Perm('{{moduleName}}:del')
  @Post('/del')
  public async postDel(@Req() req: any, @Res() res: any, next: any) {
    const result = { msg: '' };
    const { ids } = req.body;

    if (!ids) {
      result.msg = 'ID cannot be empty';
      return res.fail(result);
    }

    const idArray = ids.split(',');

    try {
      const deletedCount = await models.{{moduleName}}.destroy({
        where: { id: { [Op.in]: idArray } },
      });

      await common.saveOperateLog(req, `delete：${deletedCount}`);
      return res.success({ msg: 'delete success' });
    } catch (error) {
      log.error('Error deleting configuration:', error);
      result.msg = 'delete failed';
      res.fail(result);
    }
  }
}
