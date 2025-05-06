import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms'

export abstract class FormUtils {
  static toFilterForm = (controls = []) =>
    controls.reduce(
      (acc, name) => FormUtils.addControl(acc, name),
      new UntypedFormGroup({})
    )

  public static addControl(
    form: UntypedFormGroup,
    name: string,
    control: UntypedFormControl = new UntypedFormControl()
  ): UntypedFormGroup {
    form.addControl(name, control)
    return form
  }

  public static passwordMatchValidator(
    passwordKey: string = 'password',
    confirmPasswordKey: string = 'repassword'
  ): any {
    const returnType = (form: UntypedFormGroup) => {
      const password = form.controls[passwordKey]
      const confirmPassword = form.controls[confirmPasswordKey]
      if (
        confirmPassword.errors &&
        !confirmPassword.errors['mustMatch'] &&
        password.value !== confirmPassword.value
      ) {
        return
      }
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatched: true })
      } else {
        confirmPassword.setErrors(null)
      }
    }
    return returnType
  }

  public static emailMatchValidator(
    emailKey: string = 'email',
    confirmEmailKey: string = 'confirmemail'
  ): any {
    const returnType = (form: UntypedFormGroup) => {
      const email = form.controls[emailKey]
      const confirmEmail = form.controls[confirmEmailKey]
      if (
        confirmEmail.errors &&
        !confirmEmail.errors['mustMatch'] &&
        email.value !== confirmEmail.value
      ) {
        return
      }
      if (email.value !== confirmEmail.value) {
        confirmEmail.setErrors({ emailMismatch: true })
      }
    }
    return returnType
  }

  public static patternValidator = (
    regex: RegExp,
    error: ValidationErrors
  ): ValidatorFn => {
    return (control: AbstractControl) => {
      if (!control.value) {
        // if control is empty return no error
        return null
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value)

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error
    }
  }

  public static passwordValidator = Validators.compose([
    Validators.required,
    // check whether the entered password has a number
    FormUtils.patternValidator(/\d/, {
      hasNumber: true,
    }),
    // check whether the entered password has upper case letter
    FormUtils.patternValidator(/[A-Z]/, {
      hasCapitalCase: true,
    }),
    // check whether the entered password has a lower case letter
    FormUtils.patternValidator(/[a-z]/, {
      hasSmallCase: true,
    }),
    // check whether the entered password has a special character
    FormUtils.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
      hasSpecialCharacters: true,
    }),
    Validators.minLength(8),
    Validators.maxLength(64),
  ])

  public static submit(
    form: UntypedFormGroup | UntypedFormArray,
    callback: any,
    callbackError?: any
  ): void {
    form.markAllAsTouched()
    if (callback && form.valid) {
      callback(FormUtils.getRawValue(form))
    } else if (callbackError) {
      callbackError()
    }
  }

  public static getRawValue(
    form: UntypedFormGroup | UntypedFormArray,
    options = {}
  ): any {
    const values = form.getRawValue()
    if (values && !Array.isArray(values)) {
      Object.keys(options).forEach((key) => {
        if (values[key]) {
          values[options[key]] = values[key]
          // delete values[key];
        }
      })
    }
    return values
  }

  public static getValue(form: UntypedFormGroup, name: string): any {
    return form.get(name)?.value
  }

  public static setValue(
    form: UntypedFormGroup,
    name: string,
    value: any
  ): void {
    form.get(name)?.setValue(value)
  }

  public static setControlError(
    formControl: AbstractControl,
    errorResponseCode: string
  ): void {
    const errors = {}
    errors[errorResponseCode] = true
    formControl.setErrors(errors)
  }

  public static endDateValidator(
    startDateControlName: string,
    maxSelectableDateRange?: number,
    defaultMaxRange: number = 30
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const endDate = control.value
      const startDate = control.parent?.get(startDateControlName)?.value

      if (endDate && startDate) {
        const maxDate = new Date(startDate)
        maxDate.setDate(
          startDate.getDate() + (maxSelectableDateRange || defaultMaxRange)
        )

        if (endDate.getTime() > maxDate.getTime()) {
          return { endDateInvalid: true }
        }
      }
      return null
    }
  }
}
