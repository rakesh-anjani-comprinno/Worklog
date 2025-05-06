export abstract class ObjectUtils {
  // clean the object of any key as null , undefined , empty string , empty object or empty array value
  public static cleanObject = (
    obj: Record<string, any>
  ): Record<string, any> => {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedValue = ObjectUtils.cleanObject(value)
          if (Object.keys(cleanedValue).length > 0) {
            result[key] = cleanedValue
          }
        } else {
          result[key] = value
        }
      }
    }
    return result
  }
}
