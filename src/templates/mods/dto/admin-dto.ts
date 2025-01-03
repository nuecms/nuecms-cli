import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Validate,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  type ValidationArguments,
  IsInt,
  Min,
} from 'class-validator';

// Custom Validator for options when type is not 'input', 'textarea', or 'upload'
@ValidatorConstraint({ name: 'OptionsRequiredForSpecificTypes', async: false })
class OptionsRequiredForSpecificTypesConstraint implements ValidatorConstraintInterface {
  validate(options: string, args: ValidationArguments): boolean {
    const type = (args.object as any).type;
    const exemptTypes = ['input', 'textarea', 'upload']; // Types that do not require 'options'
    return exemptTypes.includes(type) || (typeof options === 'string' && options.trim().length > 0);
  }

  defaultMessage(args: ValidationArguments) {
    return '变量选项不能为空 (Variable options cannot be empty)';
  }
}

export class {{ModuleName}}Dto {
  @IsOptional()
  @IsNumber()
  id?: number;



  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsString()
  ctip?: string;


  @IsOptional()
  @IsString()
  @Validate(OptionsRequiredForSpecificTypesConstraint)
  options: string;
}

export class {{ModuleName}}ListDTO {

  @IsInt()
  @Min(1)
  page: number = 1;

  @IsInt()
  @Min(10)
  pageSize: number = 10;


  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  varname?: string;
}




