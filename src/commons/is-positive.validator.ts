import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isPositive', async: false })
export class IsPositiveValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const isNumber = typeof value === 'number' || typeof value === 'string' && !isNaN(parseFloat(value));
    const isNegative = isNumber && Number(value) < 0;
    return !isNegative;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} 값은 양수여야 합니다.`;
  }
}
