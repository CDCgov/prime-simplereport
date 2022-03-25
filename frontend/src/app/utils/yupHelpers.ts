import * as yup from "yup";

type Errors<T> = Record<keyof T, string>;

interface FormValidProps<T> {
  data: T;
  schema: yup.SchemaOf<T>;
}

interface Success {
  valid: true;
}

interface Failure<T> {
  valid: false;
  errors: Errors<T>;
}
/**
 * Unpacking the errors from yup's validate function is complicated.
 *
 * This helper is aimed to abstract out that complexity and handle parsing the errors out of the
 * validation error exception.
 */
export const isFormValid = async <T>({
  data,
  schema,
}: FormValidProps<T>): Promise<Success | Failure<T>> => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { valid: true };
  } catch (e: any) {
    if (e instanceof yup.ValidationError) {
      return {
        valid: false,
        errors: e.inner.reduce((acc, el) => {
          if (el.path) {
            acc[el.path as keyof T] = el.message;
          }
          return acc;
        }, {} as Record<keyof T, string>),
      };
    } else {
      throw e;
    }
  }
};

interface FieldValidProps<T> {
  data: T;
  field: keyof T;
  schema: yup.SchemaOf<T>;
  errors: Errors<T>;
}

export const isFieldValid = async <T>({
  data,
  field,
  schema,
  errors,
}: FieldValidProps<T>): Promise<Errors<T>> => {
  try {
    await schema.validateAt(field as string, data);
    return { ...errors, [field]: undefined };
  } catch (e: any) {
    if (e instanceof yup.ValidationError) {
      return { ...errors, [field]: e.message };
    } else {
      throw e;
    }
  }
};
